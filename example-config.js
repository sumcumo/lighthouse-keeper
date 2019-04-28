module.exports = {
  extends: 'recommended',
  urls: [
    'https://www.example.com/',
  ],
  scores: {
    performance: 90,
    accessibility: 90,
    'best-practices': 90,
    seo: 80,
  },
  skipAudits: [
    'uses-responsive-images',
    'uses-webp-images',
    'meta-description',
  ],
  extendedInfo: true,
}