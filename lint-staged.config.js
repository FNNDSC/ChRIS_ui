module.exports = {
  '*.{js,ts,tsx}': ['eslint --fix', () => 'tsc-files --noEmit'],
  '*.{js,ts,tsx,json,css,jsx}': ['npm run format'],
  '*.js': 'eslint --cache --fix',
}
