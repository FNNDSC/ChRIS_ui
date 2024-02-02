/**
 * This module provides helper functions for finding "subject folders" within a set of ChRIS files.
 */

// INVARIANT: A "parentDir" must NOT have trailing slash.

type PublicDatasetFile = {
  file_resource: string,
  url: string,
  id: number,
  creation_date: string,
  fname: string,
  fsize: number,
  feed_id: number,
  plugin_inst_id: number,
}

type Subject = {
  name: string,
  dir: string,
  files: PublicDatasetFile[]
};

function groupBySubject(files: PublicDatasetFile[], magicFilename: string): Subject[] {
  const magicFile = files.find((file) => file.fname.endsWith(magicFilename));
  if (magicFile === undefined) {
    return [];
  }

  const subdirs = subdirsOf(dirname(magicFile.fname), files.map((file) => file.fname));
  return [...subdirs].map((subdir) => {
    return {
      name: basename(subdir),
      dir: subdir,
      files: files.filter((file) => file.fname.startsWith(subdir))
    }
  });
}

function basename(path: string): string {
  const i = path.lastIndexOf('/');
  return path.substring(i === -1 ? 0 : i + 1);
}

function dirname(path: string): string {
  const i = path.lastIndexOf('/');
  return path.substring(0, i === -1 ? path.length : i);
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

function filestemOf(s: string, suffix: string): string {
  const iSlash = s.lastIndexOf('/');
  const start = iSlash === -1 ? 0 : iSlash + 1;
  const end = s.length - suffix.length;
  return s.substring(start, end);
}

export { subdirsOf, groupBySubject, filestemOf, basename };
export type { Subject, PublicDatasetFile };
