import { SeriesKey, StudyKey } from "./types.ts";
import { StudyAndSeries } from "../../api/pfdcm/models.ts";

/**
 * A type subset of {@link StudyAndSeries}.
 */
type StudyAndSeriesUidOnly = {
  study: {
    StudyInstanceUID: string;
  };
  series: ReadonlyArray<{
    SeriesInstanceUID: string;
  }>;
};

/**
 * Zip together the `pacs_name` from `studies` with every series in `studyAndSeries`.
 */
function zipPacsNameAndSeriesUids(
  studies: ReadonlyArray<StudyKey>,
  studyAndSeries?: ReadonlyArray<StudyAndSeriesUidOnly>,
): SeriesKey[] {
  if (!studyAndSeries) {
    return [];
  }
  const studyUidToPacsName = studies.reduce(
    (map, { StudyInstanceUID, pacs_name }) =>
      map.set(StudyInstanceUID, pacs_name),
    new Map(),
  );
  return studyAndSeries
    .map(({ study, series }) => ({
      study,
      series,
      pacs_name: studyUidToPacsName.get(study.StudyInstanceUID),
    }))
    .filter(({ pacs_name }) => pacs_name !== undefined)
    .flatMap(({ series, pacs_name }) =>
      series.map(({ SeriesInstanceUID }) => ({
        pacs_name,
        SeriesInstanceUID,
      })),
    );
}

export type { StudyAndSeriesUidOnly };
export { zipPacsNameAndSeriesUids };