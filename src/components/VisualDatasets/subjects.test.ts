import { expect, test } from "vitest";
import { filestemOf, subdirsOf, basename, groupBySubject, PublicDatasetFile } from "./subjects.ts";

const DATA = [
  'a/b/.is.chris.publicdataset',
  'a/b/c/1',
  'a/b/c/2',
  'a/b/z',
  'a/b/y/4',
];

test('groupBySubject', () => {
  const mockChrisFiles = DATA.map((fname, i): PublicDatasetFile => {
    return {
      file_resource: `https://example.com/api/v1/files/${i}/${fname}`,
      url: `https://example.com/api/v1/files/${i}/`,
      id: i,
      creation_date: "fake date",
      fname,
      fsize: 0,
      feed_id: 1,
      plugin_inst_id: 1
    }
  });
  const actual = groupBySubject(mockChrisFiles, '.is.chris.publicdataset');
  const names = actual.map((subject) => subject.name);
  expect(names).toContain('c');
  expect(names).toContain('y');
  expect(names).toHaveLength(2);
})

test('subdirsOf', () => {
  expect(subdirsOf('a/b', DATA)).toStrictEqual(new Set(['a/b/c', 'a/b/y']));
});

test.each([
  ["fetalmri-templates/Age 22/template.nii.gz", "template"],
  ["fetalmri-templates/Age 24/ventricles.nii.gz", "ventricles"],
])('filestemOf("%s", ".nii.gz") -> "%s"', (path, expected) => {
  expect(filestemOf(path, '.nii.gz')).toBe(expected);
});

test.each([
  ['a/b', 'b'],
  ['a/b/c', 'c'],
])('basename("%s") -> "%s"', (path, expected) => {
  expect(basename(path)).toBe(expected);
});
