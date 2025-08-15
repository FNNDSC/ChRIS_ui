import seriesMap from "../../../api/lonk/seriesMap";
import type { PacsSeriesMap } from "../../../reducers/pacs";
import { seriesUIDToSeriesMapKey } from "../../../reducers/utils";
import {
  PacsSeriesCSVKeys,
  PacsSeriesState,
  PacsStudyCSVKeys,
  type PacsStudyState,
} from "../types";

const csvLine = (data: string[]) =>
  data
    .map((v) => v.replaceAll('"', '""')) // escape double quotes
    .map((v) => `"${v}"`) // quote it
    .join(","); // comma-separated

export const downloadStudiesToCSV = (
  studies: PacsStudyState[],
  searchMode: string,
) => {
  const csvKeys = csvLine(PacsStudyCSVKeys.concat(PacsSeriesCSVKeys));
  const studyCSV = studies.map(({ info, series }) =>
    series
      .map((eachSeries) => {
        const studyList: string[] = PacsStudyCSVKeys.map((each) =>
          // @ts-expect-error
          String(info[each] || ""),
        );
        const seriesList = PacsSeriesCSVKeys.map((each) =>
          // @ts-expect-error
          String(eachSeries.info[each] || ""),
        );

        return csvLine(studyList.concat(seriesList));
      })
      .join("\r\n"),
  );

  const theCSV = [csvKeys].concat(studyCSV).join("\r\n");

  const blob = new File([theCSV], "PACS.csv", { type: "text/csv" });

  const downloadLink = document.createElement("a");
  const dataUrl = URL.createObjectURL(blob);
  downloadLink.href = dataUrl;

  const filenameNumber =
    searchMode === "mrn"
      ? studies[0].info.PatientID
      : studies[0].info.AccessionNumber;

  const filename = `PACS-${searchMode}-${filenameNumber}.csv`;
  downloadLink.download = filename;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

export const getSeriesDescription = (
  pacs_name: string,
  SeriesInstanceUID: string,
  seriesMap: PacsSeriesMap,
) => {
  const key = seriesUIDToSeriesMapKey(pacs_name, SeriesInstanceUID);
  const series = seriesMap[key];
  if (!series) {
    return SeriesInstanceUID;
  }
  return series.info.SeriesDescription;
};
