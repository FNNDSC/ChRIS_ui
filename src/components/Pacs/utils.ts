import {
  createDataWithFilepath,
  getPACSSeriesListBySeriesUID,
} from "../../api/serverApi";

import type { PACSSeries } from "../../api/types.ts";

export const createFeedWithSeriesInstanceUID = async (seriesUID: string) => {
  const pacsSeriesListResult = await getPACSSeriesListBySeriesUID(seriesUID);
  const { data: pacsSeriesList } = pacsSeriesListResult;
  if (!pacsSeriesList) {
    return;
  }

  for (const pacsSeries of pacsSeriesList) {
    await createFeedWithPACSSeries(pacsSeries);
  }

  return;
};

export const createFeedWithPACSSeries = async (series: PACSSeries) => {
  const {
    folder_path: thePath,
    PatientID: patientID,
    StudyDate: studyDate,
    StudyDescription: studyDescription,
    SeriesDescription: seriesDescription,
  } = series;

  const studyDateStr = studyDate.replace(/[^0-9]/g, "");

  const theName = `PACS-${patientID}-${studyDateStr}-${studyDescription}-${seriesDescription}`;

  const tags = ["pacs"];
  return await createDataWithFilepath(thePath, theName, tags);
};

export const errorCodeIs4xx = (e: { code: number }) => {
  console.info("PacsApp: lonk: errorCodeIs4xx: e:", e);
  return e.code >= 400 && e.code < 500;
};

export const errorCodeIsNot4xx = (e: { code: number }) => {
  console.info("PacsApp: lonk: errorCodeIsNot4xx: e:", e);
  return e.code < 400 || e.code >= 500;
};
