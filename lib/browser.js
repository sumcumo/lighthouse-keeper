import { log } from './logger'

const chromeLauncher = require('chrome-launcher')

export default async function launch() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--disable-gpu',
      '--headless',
      '--no-sandbox',
      '--enable-logging',
      '--disable-dev-shm-usage',
      /**
       * The people from puppeteer even suggests more default flags:
       * https://github.com/puppeteer/puppeteer/blob/master/lib/Launcher.js
       * */
    ],
  })

  log(`Started Chrome at "${chrome.process.spawnargs[0]}" with:
${chrome.process.spawnargs.slice(1, -1).join('\n')}`)

  return chrome
}
