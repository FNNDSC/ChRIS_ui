import React from "react";
import { useDispatch } from "react-redux";
import * as dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { Progress, ProgressSize } from "@patternfly/react-core";
import { useTypedSelector } from "../../../../store/hooks";
import {
  getDicomPatientName,
  getDicomStudyDate,
  getDicomStudyTime,
  getDicomStudyDescription,
  getDicomSeriesDate,
  getDicomSeriesTime,
  getDicomSeriesDescription,
  getDicomSeriesNumber,
  getDicomInstanceNumber,
  getDicomSliceDistance,
  getDicomEchoNumber,
  getDicomSliceLocation,
  getDicomColumns,
  getDicomRows,
  dicomDateTimeToLocale,
  isNifti,
  isDicom,
} from "../../../dicomViewer/utils";
import { setFilesForGallery } from "../../../../store/explorer/actions";
import { useHistory } from "react-router";

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

const DicomViewerContainer = () => {
  const history = useHistory();
  const files = useTypedSelector((state) => state.explorer.selectedFolder);
  const dispatch = useDispatch();
  const [progress, setProgress] = React.useState(0);

  const close = React.useCallback(() => {
    history.push("/gallery");
  }, [history]);

  const loadImagesIntoCornerstone = React.useCallback(async () => {
    if (files) {
      let step = 0;
      step = files.length / 50;
      const nextProgress = step;
      let count = 0;
      let nifti = false;

      const imageIds: string[] = [];
      let niftiSlices = 0;
      for (let i = 0; i < files.length; i++) {
        const selectedFile = files[i].file;
        if (selectedFile) {
          if (isNifti(selectedFile.data.fname)) {
            nifti = true;
            const fileArray = selectedFile.data.fname.split("/");
            const fileName = fileArray[fileArray.length - 1];
            const imageIdObject = ImageId.fromURL(
              `nifti:${selectedFile.url}${fileName}`
            );

            niftiSlices = cornerstone.metaData.get(
              "multiFrameModule",
              imageIdObject.url
            ).numberOfFrames;

            imageIds.push(
              ...Array.from(
                Array(niftiSlices),
                (_, i) =>
                  `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`
              )
            );
          } else if (isDicom(selectedFile.data.fname)) {
            const file = await selectedFile.getFileBlob();
            imageIds.push(
              cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
            );
          } else {
            const file = await selectedFile.getFileBlob();
            imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
          }
        }
      }

      const items: any[] = [];

      let item = {};

      if (nifti) {
        for (let i = 0; i < imageIds.length; i++) {
          cornerstone.loadImage(imageIds[i]).then(
            (image: any) => {
              item = {
                image: image,
                imageId: imageIds[i],
                nifti: nifti,
                sliceMax: niftiSlices,
              };
              items.push(item);
              count++;
              const progress = Math.floor(count * (100 / imageIds.length));
              setProgress(progress);
              if (count === imageIds.length) {
                dispatch(setFilesForGallery(items));
                close();
              }
            },
            (e: any) => {
              count++;
              console.log("Error in reading multiple files", e);
            }
          );
        }
      } else {
        for (let i = 0; i < files.length; i++) {
          const selectedFile = files[i].file;
          cornerstone.loadImage(imageIds[i]).then(
            (image: any) => {
              if (image.data) {
                const patientName = getDicomPatientName(image);
                const studyDate = getDicomStudyDate(image);
                const studyTime = getDicomStudyTime(image);
                const studyDescription = getDicomStudyDescription(image);

                const seriesDate = getDicomSeriesDate(image);
                const seriesTime = getDicomSeriesTime(image);
                const seriesDescription = getDicomSeriesDescription(image);
                const seriesNumber = getDicomSeriesNumber(image);

                const instanceNumber = getDicomInstanceNumber(image);
                const sliceDistance = getDicomSliceDistance(image);
                const echoNumber = getDicomEchoNumber(image);
                const sliceLocation = getDicomSliceLocation(image);
                const columns = getDicomColumns(image);
                const rows = getDicomRows(image);
                const studyDateTime =
                  studyDate === undefined
                    ? undefined
                    : dicomDateTimeToLocale(`${studyDate}.${studyTime}`);

                item = {
                  imageId: imageIds[i],
                  instanceNumber: instanceNumber,
                  name: selectedFile?.data.fname,
                  image: image,
                  rows: rows,
                  columns: columns,
                  sliceDistance: sliceDistance,
                  sliceLocation: sliceLocation,
                  patient: {
                    patientName: patientName,
                  },
                  study: {
                    studyDate: studyDate,
                    studyTime: studyTime,
                    studyDateTime: studyDateTime,
                    studyDescription: studyDescription,
                  },
                  series: {
                    seriesDate: seriesDate,
                    seriesTime: seriesTime,
                    seriesDescription: seriesDescription,
                    seriesNumber: seriesNumber,
                    echoNumber: echoNumber,
                  },
                  sliceMax: imageIds.length,
                };
              }

              items.push(item);
              count++;
              const progress = Math.floor(count * (100 / files.length));
              if (progress > nextProgress) {
                setProgress(progress);
              }
              if (count === files.length) {
                dispatch(setFilesForGallery(items));
                close();
              }
            },
            (e: any) => {
              console.log("Error in reading multiple files", e);
              count++;
            }
          );
        }
      }
    }
  }, [files, dispatch, close]);

  React.useEffect(() => {
    loadImagesIntoCornerstone();
  }, [loadImagesIntoCornerstone]);

  return (
    <Progress
      value={progress}
      title="Opening Multiple Files"
      size={ProgressSize.sm}
    />
  );
};

export default DicomViewerContainer;
