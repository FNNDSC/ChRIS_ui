#!/usr/bin/env node
// purpose: print out a version string: YYYYMMDD.X-commit(-dirty?)
//          YYYYMMDD = current date
//                 X = number of merge commits since a specific commit in the past
//            commit = HEAD commit short sha
//            -dirty = suffix indicating there are uncommitted changes

import * as childProcess from "child_process";

const VERSION_ZERO = 'ab2b83b3c376a66fa30ebcb764b1aaed604c656c';

const date = new Date();
const year = date.getFullYear();
const month = padStart2(date.getMonth() + 1);
const day = padStart2(date.getDate());
const nMergeCommits = git('rev-list', '--use-bitmap-index', '--count', '--merges', `${VERSION_ZERO}..HEAD`);
const commitShortSha = git('rev-parse', '--short', 'HEAD');
const dirtySuffix = gitIsDirty() ? '-dirty' : '';

console.log(`${year}${month}${day}.${nMergeCommits}-${commitShortSha}${dirtySuffix}`);

function git(...args) {
  return childProcess.execFileSync('git', args, {encoding: "utf-8"}).trim();
}

function gitIsDirty() {
  try {
    git('diff', '--quiet', 'src/');
    return false;
  } catch (e) {
    if (e.pid && e.status === 1) {
      return true;
    }
    throw e;
  }
}

function padStart2(x) {
  return `${x}`.padStart(2, '0');
}
