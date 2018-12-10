const chromeLauncher = require('chrome-launcher')

export default async function launch() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--disable-gpu', '--headless', '--no-sandbox', '--enable-logging'],
  })

  return chrome
}
