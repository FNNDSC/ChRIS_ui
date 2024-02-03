import { test, expect } from 'vitest';
import EXAMPLE_FILES from "./exampleData.ts";
import { pairNiftisWithAssociatedOptions } from "./associatedOptions.ts";

test('pairNiftisWithAssociatedOptions', () => {
  const actual = pairNiftisWithAssociatedOptions(Object.values(EXAMPLE_FILES));;
  const expected = [
    { nifti: EXAMPLE_FILES.seragNifti, option: EXAMPLE_FILES.seragSidecar },
    { nifti: EXAMPLE_FILES.otherNifti, option: null },
    { nifti: EXAMPLE_FILES.aliNifti, option: EXAMPLE_FILES.aliSidecar },
  ];
  expect(actual).toEqual(expected);
});
