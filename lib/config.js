import recommendedOptions from './configs/recommended'

const fs = require('fs')
const { argv } = require('yargs')

const getConfig = () => {
  const configFile = argv.config
  let options = {}
  if (configFile) {
    const data = fs.readFileSync(configFile, 'utf8')
    const parsedOptions = JSON.parse(data)

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
