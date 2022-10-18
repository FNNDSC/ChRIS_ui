// Edited code 
/**
 * @param {string} command 
 * @param {Object} Options on executing the code
 * 
 * @returns A promise - String, Undefined or Error
 */

const exec = (command, {capture = false, echo = false } = {}) => {
  command = command.replace(/\\?\n/g, ''); // Multi line commands into one string
  if (echo) {
    console.log(command);
  }

  const spawn = require('child_process').spawn;
  const childProcess = spawn('bash', ['-c', command], {stdio: capture ? 'pipe' : 'inherit'});

  return new Promise((resolve, reject) => {
    let stdout = '';
    if (capture) {
      childProcess.stdout.on('data', (data) => {
        stdout += data;
      })
    }

    childProcess.on('error', function (error) {
      reject({code: 1, error: error});
    })

    childProcess.on('close', function (code) {
      if (code > 0) {
        reject({code: code, error: 'command failed with code ' + code});
      }
      else {
        resolve({code: code, data: stdout});
      }
    })
  })
}

const printVersion = async() => {
  const date = (await exec('date "+%Y%m%d"', {capture: true})).data;
  const rev_list = (await exec('git rev-list version-0..HEAD --count --merges', {capture: true})).data;
  const rev_parse = (await exec('git rev-parse --short HEAD', {capture: true})).data;
  const diff = (await exec('git diff --quiet src/ || echo "-dirty"', {capture: true})).data;
  const formattedDate = `${date}.${rev_list}+${rev_parse}${diff}`
  return (
    
    formattedDate
    )
}
  
 
export default printVersion;
  
// End of Edited code

  // PREVIOUS CODE


  
  // import { exec } from 'node:child_process';
  // purpose: print out a version string: YYYYMMDD.X+commit(-dirty?)
  //           YYYYMMDD = current date
  //                  X = number of merge commits since the tag version-0
  //             commit = HEAD commit short sha
  //             -drity = suffix indicating there are uncommitted changes


  // const print_version = () => {
//   const getTodaysDate = () => {
//     const today = new Date();
//     const yyyy = today.getFullYear().toString();
//     const mm = String(today.getMonth() + 1).padStart(2, '0');
//     const dd = String(today.getDate()).padStart(2, '0');
//     return ( 
//       today = yyyy + mm + dd
//      );
//   }
  
//   // const date = exec('date "+%Y%m%d"')
//   // OR
//   const date = getTodaysDate();
  
//   const rev_list = exec('git rev-list version-0..HEAD --count --merges', (error) => {
//     if (error) {
//       console.log(`rev-list error: ${error}`)
//     }
//   })
  
//   const rev_parse = exec('git rev-parse --short HEAD', (error) => {
//     if (error) {
//       console.log(`rev-parse error: ${error}`)
//     }
//   })
  
//   const diff = exec('git diff --quiet src/ || echo "-dirty"', (error) => {
//     if (error) {
//       console.log(`git diff error: ${error}`)
//     }
//   })
//   console.log("%s.%s+%s%s", date, rev_list, rev_parse, diff)
//   const formattedDate = `${date}.${rev_list}+${rev_parse}${diff}`
//   return ( 
//     formattedDate
//    );
// }
 
// export default print_version;