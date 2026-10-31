export default {
  '*.{ts,tsx,js,mjs}': [
    'oxlint --fix --deny-warnings',
    'oxfmt --write --no-error-on-unmatched-pattern'
  ],
  '*.{astro,css,json,yaml,yml,md}':
    'oxfmt --write --no-error-on-unmatched-pattern'
}
