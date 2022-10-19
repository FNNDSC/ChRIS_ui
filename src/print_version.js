import preval from "preval.macro";

//  purpose: print out a version string: YYYYMMDD.X+commit(-dirty?)
//           YYYYMMDD = current date
//                  X = number of merge commits since the tag version-0
//             commit = HEAD commit short sha
//             -drity = suffix indicating there are uncommitted changes

const printVersion =  preval(`
const getTodaysDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear().toString();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return [yyyy, mm, dd].join("");
}

const diff = () => {
  const { spawn } = require('child_process')
  const diffChild = spawn('git', ['diff', '--quiet', 'src/'])
  let exitCode = 0; 
  diffChild.on('exit', function(code){
         if(code === 1){
            exitCode = 1; 
         }
  })
  return (exitCode)? "" : "-dirty";
}

const revParse = () => {
  const execSync = require('child_process').execSync;
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    return 'unknown';
  }
}

const revList = () => {
  const { execSync } = require('child_process');
  return execSync('git rev-list --use-bitmap-index --count --merges version-0..HEAD').toString().trim();
}

const date = getTodaysDate();
const X = revList(); 
const commit = revParse(); 
const dirty = diff()
const result = date + "." + X + "+" + commit +  dirty
module.exports=result
`)
export default printVersion;