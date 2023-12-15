import { expect, test } from "vitest";
import { filestemOf, parentDirOf, subdirsOf } from "./subjects.ts";

const DATA = [
  'a/b/c/1',
  'a/b/c/2',
  'a/b/z',
  'a/b/y/4'
];


test('parentDirOf', () => {
  expect(parentDirOf(DATA)).toBe('a/b');
});

test('subdirsOf', () => {
  expect(subdirsOf('a/b', DATA)).toStrictEqual(new Set(['a/b/c', 'a/b/y']));
});

test.each([
  ["fetalmri-templates/Age 22/template.nii.gz", "template"],
  ["fetalmri-templates/Age 24/ventricles.nii.gz", "ventricles"],
])("filestemOf(%s, '.nii.gz') -> %s", (path, expected) => {
  expect(filestemOf(path, '.nii.gz')).toBe(expected);
});
