# Lighthouse Keeper

Lighthouse Keeper makes it easier to run specific [Lighthouse](https://github.com/GoogleChrome/lighthouse) audits on a set of URLs.

## Installation

```bash
npm install --save-dev @sum.cumo/lighthouse-keeper
```

### Google Chrome

You need a [Chrome installation](https://developers.google.com/web/updates/2017/04/headless-chrome) in order to be able to use Lighthouse.

## Usage

### With JSON config file

```bash
lighthouse-keeper --config path/to/config.json
```

#### Options

These are the possible options for the configuration file:

| Option        | Description   | Default |
| ------------- | ------------- | ------------- |
| extends | name of a predefined set of configurations | optional |
| urls | array of URLs to scan | `[]` |
| extendedInfo | display extended info of the audit | `false` by default. If the audit is not satisfied extendInfo turns true |
| allAudits| indicates if all audits should be evaluated | `false` |
| onlyAudits| array of audit keys to evaluate (see below) | `[]` |
| skipAudits| array of audit keys to be skipped (see below) | `[]` |
| scores| object of minimum scores per category (see below) to obtain | `{}` |

#### Recommended options

There is a predefined set of options called 'recommended. This looks like this:

```json
skipAudits: [
  "uses-webp-images",
  "hreflang",
  "webapp-install-banner",
  "without-javascript",
]
```

#### Example

```json
{
  "extends": "recommended",
  "urls": [
    "https://www.example.com/"
  ],
  "scores": {
    "performance": 90,
    "accessibility": 90,
    "best-practices": 90,
    "seo": 80
  },
  "onlyAudits": [
    "performance",
    "accessibility",
    "best-practices",
    "seo"
  ],
  "skipAudits": [
    "uses-responsive-images",
    "uses-webp-images",
    "meta-description"
  ],
  "extendedInfo": true
}
```

([Reasoning behind this sample config.](https://meiert.com/en/blog/lighthouse-config/))

### Without config file

```bash
lighthouse-keeper --url https://www.example.com --audits accesskeys,uses-http2 --scores seo:90,best-practices:10
```

These are the possible options for the CLI:

| Option        | Description   | Mandatory |
| ------------- | ------------- | ------------- |
| url | the URL to scan | yes |
| audits| list of audits that should be evaluated (see below) | no |
| skip| list of audits that should be skipped (see below) | no |
| scores| list of minimum scores per category to obtain (see below) | no |
| showaudits| only show the available audits | no |

List entries must be separated by comma.

### Categories

| Category ID   | Description   |
| ------------- | ------------- |
| accessibility | These checks highlight opportunities to [improve the accessibility of your web app](https://developers.google.com/web/fundamentals/accessibility). Only a subset of accessibility issues can be automatically detected so manual testing is also encouraged. |
| best-practices | We’ve compiled some recommendations for modernizing your web app and avoiding performance pitfalls. |
| performance | These encapsulate your web app’s current performance and opportunities to improve it. |
| pwa | These checks validate the aspects of a Progressive Web App, as specified by the baseline [PWA Checklist](https://developers.google.com/web/progressive-web-apps/checklist). |
| seo | These checks ensure that your page is optimized for search engine results ranking. There are additional factors Lighthouse does not check that may affect your search ranking. [Learn more](https://support.google.com/webmasters/answer/35769). |

### Audits

If you want to see a list of all available audits, run

```bash
lighthouse-keeper --url https://www.example.com/ --showaudits
```

The `url` is actually irrelevant for the list, but needed for running Lighthouse to parse the response.

Please have in mind that there are audits like `screenshot-thumbnails` which can’t be validated. These audits are marked with a `⚠` in the audits list and with `(?)` in the result.

## License

Copyright 2018 [sum.cumo GmbH](https://www.sumcumo.com/)

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

----

[Learn more about sum.cumo](https://www.sumcumo.com/en/) or [work on open source projects](https://www.sumcumo.com/jobs/), too (Hamburg and Düsseldorf)!
