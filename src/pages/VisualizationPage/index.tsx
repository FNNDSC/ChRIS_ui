import React, { useRef } from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Button } from "antd";
import { AiOutlineUpload } from "react-icons/ai";
import {
  ModalVariant,
  Modal,
  ProgressSize,
  Progress,
} from "@patternfly/react-core";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
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
} from "../../components/dicomViewer/utils";

const VisualizationPage = () => {
  const fileOpen = useRef<HTMLInputElement>(null);
  const folderOpen = useRef<HTMLInputElement>(null);
  const [visibleModal, setVisibleModal] = React.useState(false);
  const [files, setFiles] = React.useState<any[]>();
  const handleOpenFolder = (files: any) => {
    setVisibleModal(true);
    setFiles(files);
  };

  const handleOpenLocalFs = (files: any) => {
    setVisibleModal(true);
    setFiles(files);
  };

  const showOpenFolder = () => {
    if (folderOpen.current) {
      folderOpen.current.click();
    }
  };
  const showOpenFile = () => {
    if (fileOpen.current) {
      fileOpen.current.click();
    }
  };

  const handleModalClose = () => {
    setVisibleModal(false);
  };

  console.log("Files", files);

  return (
    <Wrapper>
      <div>
        <Button onClick={showOpenFolder} icon={<AiOutlineUpload />}>
          Upload a Directory
        </Button>
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload Files
        </Button>
      </div>
      <DicomModal
        files={files}
        visibleModal={visibleModal}
        handleModalClose={handleModalClose}
      />
      <div>
        <input
          type="file"
          id="file_open"
          style={{ display: "none" }}
          ref={fileOpen}
          multiple
          onChange={(e) => handleOpenLocalFs(e.target.files)}
        />

        <input
          type="file"
          id="file_folder"
          style={{ display: "none" }}
          onChange={(e) => handleOpenFolder(e.target.files)}
          multiple
          //@ts-ignore
          webkitdirectory=""
          mozdirectory=""
          directory=""
          ref={folderOpen}
        />
      </div>
    </Wrapper>
  );
};

export default VisualizationPage;

export const DicomModal = ({
  files,
  visibleModal,
  handleModalClose,
}: {
  visibleModal: boolean;
  handleModalClose: () => void;
  files?: any[];
}) => {
  const [modifiedFiles, setModifiedFiles] = React.useState<any[]>();
  const [progress, setProgress] = React.useState<number>(0);

  const close = React.useCallback(() => {
    handleModalClose();
  }, [handleModalClose]);

  const loadImagesIntoCornerstone = React.useCallback(() => {
    if (files) {
      let step = 0;
      step = files.length / 50;
      const nextProgress = step;
      let count = 0;

      const imageIds: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        imageIds.push(cornerstoneWADOImageLoader.wadouri.fileManager.add(file));
      }

      const items: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        cornerstone.loadImage(imageIds[i]).then(
          (image: any) => {
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

            const item = {
              imageId: imageIds[i],
              instanceNumber: instanceNumber,
              name: file.name,
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
            };
            items.push(item);
            count++;
            const progress = Math.floor(count * (100 / files.length));
            if (progress > nextProgress) {
              setProgress(progress);
            }
            if (count === files.length) {
              console.log("Close called");
              close();
            }
          },
          (e: any) => {
            console.log("Error in reading multiple files", e);
            count++;
          }
        );
      }
      console.log("Items", items);
      setModifiedFiles(items);
    }
  }, [files, close]);

  React.useEffect(() => {
    loadImagesIntoCornerstone();
  }, [loadImagesIntoCornerstone]);
  return (
    <Modal
      title="Multiple File Dialog"
      variant={ModalVariant.small}
      isOpen={visibleModal}
      onClose={handleModalClose}
    >
      <Progress
        value={progress}
        title="Opening Multiple Files"
        size={ProgressSize.sm}
      />
    </Modal>
  );
};
