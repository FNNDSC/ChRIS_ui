import preval from "preval.macro";

//  purpose: print out a version string: YYYYMMDD.X+commit(-dirty?)
//           YYYYMMDD = current date
//                  X = number of merge commits since the tag version-0
//             commit = HEAD commit short sha
//             -drity = suffix indicating there are uncommitted changes

const printVersion =  preval(`
  const execSync = require('child_process').execSync;
  const shell = require('shelljs');

  const getTodaysDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return [yyyy, mm, dd].join("");
  }

  const diff = () => {
    // Run external tool synchronously
    result = shell.exec('git diff --quiet src/').code
    return (result) ? "" : "-dirty";
  }

  const revParse = () => {
    return execSync('git rev-parse --short HEAD').toString().trim();
  }

  const revList = () => {
    return execSync('git rev-list --use-bitmap-index --count --merges version-0..HEAD').toString().trim();
  }

  const date = getTodaysDate();
  const X = revList(); 
  const commit = revParse(); 
  const dirty = diff()
  const result = date + "." + X + "+" + commit +  dirty
  module.exports = result
`)

export default printVersion;