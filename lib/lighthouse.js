import launchBrowser from './browser'

const lighthouse = require('lighthouse')

const run = async (url, config = null) => {
  const chrome = await launchBrowser()
  const options = {
    port: chrome.port,
  }

  const { lhr } = await lighthouse(url, options, config)

  await chrome.kill()

  return lhr
}

export default run

export {
  run,
}
