import {
  createFeedWithFilepath,
  getPACSSeriesListBySeriesUID,
} from "../../api/serverApi";

import type { PACSSeries } from "../../api/types.ts";

export const createFeedWithSeriesInstanceUID = async (seriesUID: string) => {
  console.info(
    "PacsController.createFeedWithSeriesInstanceUID: to getPACSSeriesListBySeriesUID: folderPath:",
    seriesUID,
  );
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
    Modality: modality,
  } = series;

  const studyDateStr = studyDate.replace(/[^0-9]/g, "");

  const theName = `PACS-${patientID}-${studyDateStr}-${studyDescription}-${seriesDescription}`;

  console.info(
    "PacsController.createFeedWithPACSSeries: to createFeedWithFilepath: folderPath:",
    thePath,
    "theName:",
    theName,
  );

  const tags = ["pacs"];
  return await createFeedWithFilepath({
    filepath: thePath,
    theName,
    tags,
    patientID,
    modality,
    studyDate,
    isPublic: false,
  });
};
