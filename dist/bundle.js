'use strict';

var recommendedOptions = {
  skipAudits: [
    'uses-webp-images',
    'hreflang',
    'installable-manifest',
    'without-javascript',
  ],
};

const path = require('path');
const { argv } = require('yargs');

const getConfig = () => {
  const configFile = argv.config;
  let options = {};
  if (configFile) {
    // eslint-disable-next-line
    const parsedOptions = require(path.resolve(process.cwd(), configFile));

    options = {
      ...parsedOptions,
    };

    if (parsedOptions.extends === 'recommended') {
      options = {
        ...recommendedOptions,
        ...options,
      };
    }
  } else {
    const { url } = argv;
    options.urls = [url];

    const { audits } = argv;
    if (audits) {
      options.onlyAudits = audits.split(',');
    }

    const { skip } = argv;
    if (skip) {
      options.skipAudits = skip.split(',');
    }

    const { scores } = argv;
    if (scores) {
      options.scores = {};

      scores.split(',').forEach((score) => {
        const result = score.match(/(.+):(.+)/);
        const categoryId = result[1];
        const categoryMinScore = result[2];
        options.scores[categoryId] = categoryMinScore * 1;
      });
    }
  }

  if (argv.showaudits) {
    options.showAudits = true;
  }

  return options
};

const prepareOptions = () => {
  const opts = getConfig();
  const preparedOptions = { ...opts };

  const defaults = {
    urls: [],
    extendedInfo: false,
    allAudits: false,
    onlyAudits: [],
    skipAudits: [],
  };

  const keys = Object.keys(preparedOptions);
  Object.entries(defaults).forEach((entry) => {
    const key = entry[0];
    const value = entry[1];
    if (!keys.includes(key)) {
      preparedOptions[key] = value;
    }
  });

  return preparedOptions
};

const filterAudits = (category, options) => {
  const filteredAudits = category.auditRefs.filter((audit) => {
    let result = true;
    if (!options.allAudits) {
      if (options.onlyAudits.length > 0 && !options.onlyAudits.includes(audit.id)) {
        result = false;
      }
      if (options.skipAudits.includes(audit.id)) {
        result = false;
      }
    }

    return result
  });

  return filteredAudits
};

const validateAudits = (categories, options) => {
  if (options.onlyAudits) {
    options.onlyAudits.forEach((auditId) => {
      let validAudit = false;

      Object.keys(categories).forEach((categoryId) => {
        const category = categories[categoryId];
        if (category.auditRefs.find(auditRef => auditRef.id === auditId)) {
          validAudit = true;
        }
      });

      if (!validAudit) {
        throw new Error(`Audit <${auditId}> is unknown`)
      }
    });
  }
};

const validateCategories = (categories, options) => {
  if (options.scores) {
    Object.keys(options.scores).forEach((categoryId) => {
      const category = categories[categoryId];
      if (!category) {
        throw new Error(`Category <${categoryId}> is unknown`)
      }
    });
  }
};

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
    case 'notApplicable':
    case 'informative':
      return 2
    case 'error':
      return 0
    case 'numeric':
    case 'binary':
    default:
      return Number(audit.score) >= 0.75 ? 1 : 0
  }
};

const prettyjson = require('prettyjson');
const chalk = require('chalk');

const log = (value) => {
  console.info(value);
};

const linebreak = () => {
  log('');
};

const headline = (value) => {
  linebreak();
  log(chalk.bold.magenta('='.repeat(30)));
  log(chalk.bold.magenta(value.toUpperCase()));
  log(chalk.bold.magenta('='.repeat(30)));
};

const subHeadline = (value) => {
  linebreak();
  log(chalk.yellow('-'.repeat(30)));
  log(chalk.yellow(value));
  log(chalk.yellow('-'.repeat(30)));
};

const prettyJson = (obj) => {
  log(prettyjson.render(obj));
};

const chromeLauncher = require('chrome-launcher');

async function launch() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--disable-gpu', '--headless', '--no-sandbox', '--enable-logging'],
  });

  return chrome
}

const lighthouse = require('lighthouse');

const run = async (url, config = null) => {
  const chrome = await launch();
  const options = {
    port: chrome.port,
  };

  const { lhr } = await lighthouse(url, options, config);

  await chrome.kill();

  return lhr
};

const chalk$1 = require('chalk');
const figures = require('figures');
const Table = require('easy-table');
const lighthousePackage = require('lighthouse/package.json');

async function scan(url, options) {
  let hasFailures = false;

  const results = await run(url);

  if (options.showAudits) {
    Object.keys(results.categories).forEach((categoryId) => {
      const category = results.categories[categoryId];

      headline(category.title);

      category.auditRefs.forEach((auditRef) => {
        const audit = results.audits[auditRef.id];

        subHeadline(audit.id);
        log(`${chalk$1.underline(audit.title)}`);
        const prefix = audit.scoreDisplayMode === 'manual' ? `${chalk$1.yellow.bold(figures.warning)}  ` : '';
        log(`${prefix}${audit.description}`);
      });
    });

    return false
  }

  validateCategories(results.categories, options);

  validateAudits(results.categories, options);

  // check categories
  if (options.scores) {
    headline('scores');

    const tableData = [];

    Object.keys(options.scores).forEach((categoryId) => {
      const category = results.categories[categoryId];
      const score = category.score * 100;

      const minScore = options.scores[categoryId];
      if (minScore) {
        const passed = score >= minScore;

        let result = chalk$1.green(figures.tick);
        if (!passed) {
          result = chalk$1.red(figures.cross);
          hasFailures = true;
        }

        tableData.push({
          result,
          category: category.title,
          minScore,
          score,
        });
      }
    });

    const t = new Table();

    tableData.forEach((data) => {
      t.cell('Category', data.category);
      t.cell('Score', `${data.score} / ${data.minScore}`);
      t.cell('Result', data.result);
      t.newRow();
    });

    t.sort('Category|asc');

    linebreak();
    log(t.toString());
  }

  // check audits
  headline('audits');
  Object.keys(results.categories).forEach((categoryId) => {
    const category = results.categories[categoryId];
    const tableData = [];

    const auditRefs = filterAudits(category, options);

    if (auditRefs.length > 0) {
      subHeadline(`${category.title}`);
      auditRefs.forEach((auditRef) => {
        const audit = results.audits[auditRef.id];
        const passedStatus = auditPassedStatus(audit);
        let hasFailure = false;

        let result;
        if (passedStatus === 2) {
          result = chalk$1.blue(figures.questionMarkPrefix);
        } else if (passedStatus === 1) {
          result = chalk$1.green(figures.tick);
        } else {
          result = chalk$1.red(figures.cross);
          hasFailures = true;
          hasFailure = true;
        }

        if (hasFailure || options.extendedInfo) {
          log(chalk$1.bold.red(`${result} ${audit.id}`));
          prettyJson(audit);
          linebreak();
          linebreak();
        } else {
          tableData.push({
            audit: audit.id,
            result,
          });
        }
      });

      const t = new Table();

      tableData.forEach((data) => {
        t.cell('Passed Audits', data.audit);
        t.cell('Result', data.result);
        t.newRow();
      });

      t.sort('Audit|asc');

      linebreak();
      log(t.toString());
    }
  });

  return hasFailures
}

module.exports = async () => {
  const options = prepareOptions();
  let hasFailures = false;

  const symbol = chalk$1.bold.red(figures.pointer.repeat(3));
  const scanning = chalk$1.white(`Running Lighthouse v${lighthousePackage.version} on`);

  for (let index = 0; index < options.urls.length; index += 1) {
    const url = options.urls[index];
    log(`\n${symbol} ${scanning} ${chalk$1.bold.blue(url)}`);
    // eslint-disable-next-line no-await-in-loop
    const hasFailure = await scan(url, options);
    hasFailures = hasFailure || hasFailures;
  }

  return hasFailures
};
