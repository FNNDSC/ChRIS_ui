/**
 * Some trivial curried functions for making array map/filter code more legible.
 */

import type { Series, Study } from "../../api/pfdcm/models.ts";
import type { PACSqueryCore } from "../../api/pfdcm";

function isFromPacs(
  pacs_name: string,
): (s: { study: Pick<Study, "RetrieveAETitle"> }) => boolean {
  return (s) => s.study.RetrieveAETitle === pacs_name;
}

function sameSeriesInstanceUidAs(
  query: Pick<PACSqueryCore, "seriesInstanceUID">,
): (s: Pick<Series, "SeriesInstanceUID">) => boolean {
  return (s) => s.SeriesInstanceUID === query.seriesInstanceUID;
}

function sameStudyInstanceUidAs(
  query: Pick<PACSqueryCore, "studyInstanceUID">,
): (s: Pick<Study, "StudyInstanceUID">) => boolean {
  return (s) => s.StudyInstanceUID === query.studyInstanceUID;
}

export { isFromPacs, sameSeriesInstanceUidAs, sameStudyInstanceUidAs };
