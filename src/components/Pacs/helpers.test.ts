import { test, expect } from "vitest";
import {
  type StudyAndSeriesUidOnly,
  zipPacsNameAndSeriesUids,
} from "./helpers.ts";
import type { SeriesKey, StudyKey } from "./types.ts";

test.each(<
  [
    ReadonlyArray<StudyKey>,
    ReadonlyArray<StudyAndSeriesUidOnly> | undefined,
    ReadonlyArray<SeriesKey>,
  ][]
>[
  [[], undefined, []],
  [[{ pacs_name: "MyPACS", StudyInstanceUID: "123.456" }], undefined, []],
  [
    [
      { pacs_name: "BCH", StudyInstanceUID: "123.456" },
      { pacs_name: "MGH", StudyInstanceUID: "789.101" },
    ],
    [
      {
        study: { StudyInstanceUID: "999.888" },
        series: [{ SeriesInstanceUID: "99.88.777" }],
      },
      {
        study: { StudyInstanceUID: "123.456" },
        series: [
          { SeriesInstanceUID: "11.22.333" },
          { SeriesInstanceUID: "11.22.444" },
        ],
      },
    ],
    [
      { pacs_name: "BCH", SeriesInstanceUID: "11.22.333" },
      { pacs_name: "BCH", SeriesInstanceUID: "11.22.444" },
    ],
  ],
])(
  "zipPacsNameAndSeriesUids(%o, %o) -> %o",
  (studies, studiesAndSeries, expected) => {
    const actual = zipPacsNameAndSeriesUids(studies, studiesAndSeries);
    expect(actual).toStrictEqual(expected);
  },
);
