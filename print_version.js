import { exec } from 'node:child_process';
// purpose: print out a version string: YYYYMMDD.X+commit(-dirty?)
//           YYYYMMDD = current date
//                  X = number of merge commits since the tag version-0
//             commit = HEAD commit short sha
//             -drity = suffix indicating there are uncommitted changes

const print_version = () => {
  const getTodaysDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return ( 
      today = yyyy + mm + dd
     );
  }
  
  const date = getTodaysDate();
  
  const rev_list = exec('git rev-list version-0..HEAD --count --merges', (error) => {
    if (error) {
      console.log(`rev-list error: ${error}`)
    }
  })
  
  const rev_parse = exec('git rev-parse --short HEAD', (error) => {
    if (error) {
      console.log(`rev-parse error: ${error}`)
    }
  })
  
  const diff = exec('git diff --quiet src/ || echo "-dirty"', (error) => {
    if (error) {
      console.log(`git diff error: ${error}`)
    }
  })
  console.log("%s.%s+%s%s", date, rev_list, rev_parse, diff)
  const formattedDate = `${date}.${rev_list}+${rev_parse}${diff}`
  return ( 
    formattedDate
   );
}
 
export default print_version;


// printf "%s.%s+%s%s" \
//   "$(date '+%Y%m%d')" \
//   "$(git rev-list --use-bitmap-index --count --merges version-0..HEAD)" \
//   "$(git rev-parse --short HEAD)" \
//   "$(git diff --quiet src/ || echo '-dirty')"