import {
  type Series,
  type Study,
  StudyAndSeries,
} from "../../api/pfdcm/models.ts";
import type { StudyKey } from "./types.ts";

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

function studyToStudyKey(
  s: Pick<Study, "StudyInstanceUID" | "RetrieveAETitle">,
): StudyKey {
  return {
    StudyInstanceUID: s.StudyInstanceUID,
    pacs_name: s.RetrieveAETitle,
  };
}

function seriesToStudyKey(
  s: Pick<Series, "StudyInstanceUID" | "RetrieveAETitle">,
): StudyKey {
  return {
    StudyInstanceUID: s.StudyInstanceUID,
    pacs_name: s.RetrieveAETitle,
  };
}

export type { StudyAndSeriesUidOnly };
export { studyToStudyKey, seriesToStudyKey };
