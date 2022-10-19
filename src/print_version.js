import preval from "preval.macro";

//  purpose: print out a version string: YYYYMMDD.X+commit(-dirty?)
//           YYYYMMDD = current date
//                  X = number of merge commits since the tag version-0
//             commit = HEAD commit short sha
//             -drity = suffix indicating there are uncommitted changes

const revParse = preval(`
  const execSync = require('child_process').execSync;
  try {
    module.exports = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    module.exports = 'unknown';
  }
`)

const revList = preval(`
  const { execSync } = require('child_process');
  module.exports = execSync('git rev-list --use-bitmap-index --count --merges version-0..HEAD').toString().trim();
`)

// const diff = preval(`
//   const { execSync } = require('child_process');
//   module.exports = execSync('git diff --quiet src/ || echo "-dirty"').toString().trim();
// `)

const diff = preval(`
  const { spawn } = require('child_process')
  const diffChild = spawn('git', ['diff', '--quiet', 'src/'])
  let exitCode = '';

  diffChild.on('close', (code) => {
    if (code !== 0) {
      exitCode = '-dirty';
    }
  })

  // if (diffChild.status !== null){
  //   module.exports = diffChild.status.toString();
  // }
  module.exports = exitCode;
`)

const getTodaysDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear().toString();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return [yyyy, mm, dd].join("");
}
const date = getTodaysDate();

export const printVersion = `${date}.${revList}+${revParse}${diff}`

