export default {
  input: 'lib/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  external: ['chrome-launcher', 'lighthouse'],
}
