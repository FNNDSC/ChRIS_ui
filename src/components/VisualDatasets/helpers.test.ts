import { describe, it, expect, test } from "vitest";
import { hideColorBarofInvisibleVolume } from "./helpers.ts";
import { ChNVRVolume } from "./options.tsx";

describe.concurrent('hideColorBarofInvisibleVolume', () => {
  const visibleExamples: CVDVolume[] = [
    {
      url: 'https://example.com/brain.nii.gz',
      opacity: 1.0,
      colormap: 'red',
      cal_min: 0,
      cal_max: 500,
      colorbarVisible: true,
    },
    {
      url: 'https://example.com/brain.nii.gz',
      opacity: 0.333,
      colormap: 'red',
      cal_min: 0,
      cal_max: 500,
      colorbarVisible: true,
    },
  ];

  it.each(visibleExamples)
  ('does not change visible volumes', (vol) => {
    expect(hideColorBarofInvisibleVolume(vol)).toBe(vol);
  });

  const hiddenExamples: CVDVolume[] = [
    {
      url: 'https://example.com/brain.nii.gz',
      opacity: 0.0,
      colormap: 'red',
      cal_min: 0,
      cal_max: 500,
      colorbarVisible: true,
    },
    {
      url: 'https://example.com/brain.nii.gz',
      opacity: 0.0,
      colormap: 'red',
      cal_min: 0,
      cal_max: 500,
      colorbarVisible: false,
    },
  ];

  it.each(hiddenExamples)
  ('hides the color bar for hidden volumes', (vol) => {
    expect(hideColorBarofInvisibleVolume(vol).colorbarVisible).toBe(false);
  });
});
