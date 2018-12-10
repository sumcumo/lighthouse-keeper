#!/usr/bin/env node

const bundle = require('../dist/bundle.js')

const run = async () => {
  try {
    const hasFailures = await bundle()
    process.exit(hasFailures ? 1 : 0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
