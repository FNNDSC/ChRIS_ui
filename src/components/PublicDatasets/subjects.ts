// INVARIANT: A "parentDir" must NOT have trailing slash.

import { FeedFile } from "@fnndsc/chrisapi";

type Subject = {
  name: string,
  dir: string,
  files: FeedFile[]
};

function groupBySubject(files: FeedFile[]): Subject[] {
  const fnames = files.map(file => file.data.fname);
  const parentDir = parentDirOf(fnames);
  const subdirs = subdirsOf(parentDir, fnames);
  return [...subdirs].map((subdir) => {
    return {
      name: basename(subdir),
      dir: subdir,
      files: files.filter((file) => file.data.fname.startsWith(subdir))
    }
  });
}

function basename(path: string): string {
  return path.substring(path.lastIndexOf('/'));
}

function subdirsOf(parentDir: string, allPaths: string[]): Set<string> {
  const subdirs = allPaths
    .filter(path => path.startsWith(parentDir + '/'))
    .map(path => oneDirUnder(path, parentDir))
    .filter(path => path !== '');
  return new Set(subdirs);
}

function oneDirUnder(path: string, parentDir: string): string {
  return path.substring(0, path.indexOf('/', parentDir.length + 1));
}

function parentDirOf(paths: string[]): string {
  return paths.reduce(commonPrefix, paths ? paths[0] : '');
}

function commonPrefix(a: string, b: string): string {
  const aSplit = a.split('/');
  const bSplit = b.split('/');
  const last = lastCommonIndex(aSplit, bSplit, -1);
  return last === -1 ? '' : aSplit.slice(0, last).join('/')
}

function lastCommonIndex(a: string[], b: string[], i: number): number {
  if (i >= a.length || i >= b.length || a[i] !== b[i]) {
    return i;
  }
  return lastCommonIndex(a, b, i + 1);
}

function filestemOf(s: string, suffix: string): string {
  const iSlash = s.lastIndexOf('/');
  const start = iSlash === -1 ? 0 : iSlash + 1;
  const end = s.length - suffix.length;
  return s.substring(start, end);
}

export { parentDirOf, subdirsOf, groupBySubject, filestemOf };
export type { Subject };
