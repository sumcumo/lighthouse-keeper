const prettyjson = require('prettyjson')
const chalk = require('chalk')

const log = (value) => {
  console.info(value)
}

const linebreak = () => {
  log('')
}

const headline = (value) => {
  linebreak()
  log(chalk.bold.magenta('='.repeat(30)))
  log(chalk.bold.magenta(value.toUpperCase()))
  log(chalk.bold.magenta('='.repeat(30)))
}

const subHeadline = (value) => {
  linebreak()
  log(chalk.yellow('-'.repeat(30)))
  log(chalk.yellow(value))
  log(chalk.yellow('-'.repeat(30)))
}

const prettyJson = (obj) => {
  log(prettyjson.render(obj))
}

export {
  log,
  linebreak,
  prettyJson,
  headline,
  subHeadline,
}
