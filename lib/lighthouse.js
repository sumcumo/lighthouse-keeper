import lighthouse from 'lighthouse'
import launchBrowser from './browser'

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
