import preval from "preval.macro";


export const revParse = preval(`
  const execSync = require('child_process').execSync;
  try {
    module.exports = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    module.exports = 'unknown';
  }
`)
// const revList = preval(`
//   const { execSync } = require('child_process');
//   module.exports = execSync('git rev-list version-0..HEAD --count --merges').toString().trim();
// `)
export const diff = preval(`
  const { execSync } = require('child_process');
  module.exports = execSync('git diff --quiet src/ || echo "-dirty"').toString().trim();
`)
// export const date = preval(`
//   module.exports = Date.now()
// `)

const getTodaysDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear().toString();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return [yyyy, mm, dd].join('-');
}
export const date = getTodaysDate();

