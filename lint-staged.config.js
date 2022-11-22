module.exports = {
  '*.{js,ts,tsx}': ['eslint --fix', () => 'tsc-files --noEmit'],
  '*.{js,ts,tsx,json,css,jsx}': ['npm run format:fix'],
  '*.js': 'npm run eslint --cache --fix',
}
