import recommendedOptions from './configs/recommended'

const path = require('path')
const { argv } = require('yargs')

const getConfig = () => {
  const configFile = argv.config
  let options = {}
  if (configFile) {
    // eslint-disable-next-line
    const parsedOptions = require(path.resolve(process.cwd(), configFile))

    options = {
      ...parsedOptions,
    }

    if (parsedOptions.extends === 'recommended') {
      options = {
        ...recommendedOptions,
        ...options,
      }
    }
  } else {
    const { url } = argv
    options.urls = [url]

    const { audits } = argv
    if (audits) {
      options.onlyAudits = audits.split(',')
    }

    const { skip } = argv
    if (skip) {
      options.skipAudits = skip.split(',')
    }

    const { scores } = argv
    if (scores) {
      options.scores = {}

      scores.split(',').forEach((score) => {
        const result = score.match(/(.+):(.+)/)
        const categoryId = result[1]
        const categoryMinScore = result[2]
        options.scores[categoryId] = categoryMinScore * 1
      })
    }
  }

  if (argv.showaudits) {
    options.showAudits = true
  }

  return options
}

export default getConfig

export {
  getConfig,
}
