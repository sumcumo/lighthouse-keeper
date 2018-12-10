import { getConfig } from './config'

const prepareOptions = () => {
  const opts = getConfig()
  const preparedOptions = { ...opts }

  const defaults = {
    urls: [],
    extendedInfo: false,
    allAudits: false,
    onlyAudits: [],
  }

  const keys = Object.keys(preparedOptions)
  Object.entries(defaults).forEach((entry) => {
    const key = entry[0]
    const value = entry[1]
    if (!keys.includes(key)) {
      preparedOptions[key] = value
    }
  })

  return preparedOptions
}

const filterAudits = (category, options) => {
  const filteredAudits = category.auditRefs.filter((audit) => {
    if (!options.allAudits && options.onlyAudits.length > 0) {
      if (options.onlyAudits.includes(audit.id)) {
        return true
      }
      return false
    }

    return true
  })

  return filteredAudits
}

const validateAudits = (categories, options) => {
  if (options.onlyAudits) {
    options.onlyAudits.forEach((auditId) => {
      let validAudit = false

      Object.keys(categories).forEach((categoryId) => {
        const category = categories[categoryId]
        if (category.auditRefs.find(auditRef => auditRef.id === auditId)) {
          validAudit = true
        }
      })

      if (!validAudit) {
        throw new Error(`Audit <${auditId}> is unknown`)
      }
    })
  }
}

const validateCategories = (categories, options) => {
  if (options.scores) {
    Object.keys(options.scores).forEach((categoryId) => {
      const category = categories[categoryId]
      if (!category) {
        throw new Error(`Category <${categoryId}> is unknown`)
      }
    })
  }
}

/**
 * inspired by
 * https://github.com/GoogleChrome/lighthouse/blob/0e18bd1031de567913ea73edc8e11a171f792dec/lighthouse-core/report/html/renderer/util.js
 * https://github.com/GoogleChrome/lighthouse/blob/ed5b38ecb40869dda0e817b0d268ee65bd5ad109/lighthouse-core/report/html/renderer/category-renderer.js
 *
 *  0 => not passed
 *  1 => passed
 *  2 => not applicable
 */
const auditPassedStatus = (audit) => {
  switch (audit.scoreDisplayMode) {
    case 'manual':
    case 'not-applicable':
    case 'informative':
      return 2
    case 'error':
      return 0
    case 'numeric':
    case 'binary':
    default:
      return Number(audit.score) >= 0.75 ? 1 : 0
  }
}

export default prepareOptions

export {
  prepareOptions,
  filterAudits,
  auditPassedStatus,
  validateAudits,
  validateCategories,
}
