import {
  prepareOptions,
  filterAudits,
  auditPassedStatus,
  validateAudits,
  validateCategories,
} from './utils'

import {
  log,
  prettyJson,
  linebreak,
  headline,
  subHeadline,
} from './logger'

import { run as runLighthouse } from './lighthouse'

const chalk = require('chalk')
const figures = require('figures')
const Table = require('easy-table')

async function scan(url, options) {
  let hasFailures = false

  const results = await runLighthouse(url)

  if (options.showAudits) {
    Object.keys(results.categories).forEach((categoryId) => {
      const category = results.categories[categoryId]

      headline(category.title)

      category.auditRefs.forEach((auditRef) => {
        const audit = results.audits[auditRef.id]

        subHeadline(audit.id)
        log(`${chalk.underline(audit.title)}`)
        const prefix = audit.scoreDisplayMode === 'manual' ? `${chalk.yellow.bold(figures.warning)}  ` : ''
        log(`${prefix}${audit.description}`)
      })
    })

    return false
  }

  validateCategories(results.categories, options)

  validateAudits(results.categories, options)

  // check categories
  if (options.scores) {
    headline('scores')

    const tableData = []

    Object.keys(options.scores).forEach((categoryId) => {
      const category = results.categories[categoryId]
      const score = category.score * 100

      const minScore = options.scores[categoryId]
      if (minScore) {
        const passed = score >= minScore

        let result = chalk.green(figures.tick)
        if (!passed) {
          result = chalk.red(figures.cross)
          hasFailures = true
        }

        tableData.push({
          result,
          category: category.title,
          minScore,
          score,
        })
      }
    })

    const t = new Table()

    tableData.forEach((data) => {
      t.cell('Category', data.category)
      t.cell('Score', `${data.score} / ${data.minScore}`)
      t.cell('Result', data.result)
      t.newRow()
    })

    t.sort('Category|asc')

    linebreak()
    log(t.toString())
  }

  // check audits
  headline('audits')
  Object.keys(results.categories).forEach((categoryId) => {
    const category = results.categories[categoryId]
    const tableData = []

    const auditRefs = filterAudits(category, options)

    if (auditRefs.length > 0) {
      subHeadline(`${category.title}`)
      auditRefs.forEach((auditRef) => {
        const audit = results.audits[auditRef.id]
        const passedStatus = auditPassedStatus(audit)
        let hasFailure = false

        let result
        if (passedStatus === 2) {
          result = chalk.blue(figures.questionMarkPrefix)
        } else if (passedStatus === 1) {
          result = chalk.green(figures.tick)
        } else {
          result = chalk.red(figures.cross)
          hasFailures = true
          hasFailure = true
        }

        if (hasFailure || options.extendedInfo) {
          log(chalk.bold.red(`${result} ${audit.id}`))
          prettyJson(audit)
          linebreak()
          linebreak()
        } else {
          tableData.push({
            audit: audit.id,
            result,
          })
        }
      })

      const t = new Table()

      tableData.forEach((data) => {
        t.cell('Passed Audits', data.audit)
        t.cell('Result', data.result)
        t.newRow()
      })

      t.sort('Audit|asc')

      linebreak()
      log(t.toString())
    }
  })

  return hasFailures
}

module.exports = async () => {
  const options = prepareOptions()
  let hasFailures = false

  const symbol = chalk.bold.red(figures.pointer.repeat(3))
  const scanning = chalk.white('Running Lighthouse on')

  for (let index = 0; index < options.urls.length; index += 1) {
    const url = options.urls[index]
    log(`\n${symbol} ${scanning} ${chalk.bold.blue(url)}`)
    // eslint-disable-next-line no-await-in-loop
    const hasFailure = await scan(url, options)
    hasFailures = hasFailure || hasFailures
  }

  return hasFailures
}
