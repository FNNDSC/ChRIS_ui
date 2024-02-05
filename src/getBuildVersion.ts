import preval from "preval.macro";

const BUILD_VERSION: string = preval`
const { execSync } = require('child_process')
module.exports = execSync('npm run -s print-version', {encoding: 'utf-8'})
`;

export default BUILD_VERSION;
