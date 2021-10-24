import React, { useRef, useMemo } from "react";
import { useHistory } from "react-router";
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
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as dicomParser from "dicom-parser";
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
} from "../../components/dicomViewer/utils";
import { useDispatch } from "react-redux";
import { setFilesForGallery } from "../../store/explorer/actions";
import { setSidebarActive } from "../../store/ui/actions";
import { useDropzone } from "react-dropzone";

cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const VisualizationPage = () => {
  const fileOpen = useRef<HTMLInputElement>(null);
  const folderOpen = useRef<HTMLInputElement>(null);
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone();
  const [visibleModal, setVisibleModal] = React.useState(false);
  const [files, setFiles] = React.useState<any[]>();
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (acceptedFiles.length > 0) setFiles(acceptedFiles);
  }, [acceptedFiles]);

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "visualizations",
      })
    );
  }, [dispatch]);

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

        <section className="container">
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <p>
              Drag &apos;n&apos; drop some files here or click to select files
            </p>
          </div>
        </section>
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
  const dispatch = useDispatch();
  const history = useHistory();
  const [progress, setProgress] = React.useState<number>(0);

  const close = React.useCallback(() => {
    history.push("/gallery");
  }, [history]);

  const loadImagesIntoCornerstone = React.useCallback(() => {
    if (files) {
      let step = 0;
      step = files.length / 50;
      const nextProgress = step;
      let count = 0;

      const imageIds: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isNifti(file.name)) {
          const url = URL.createObjectURL(file).split("blob:")[1];
          const imageIdObject = ImageId.fromURL(`nifti:${url}${file.name}`);

          const numberOfSlices = cornerstone.metaData.get(
            "multiFrameModule",
            imageIdObject.url
          ).numberOfFrames;

          imageIds.push(
            ...Array.from(
              Array(numberOfSlices),
              (_, i) =>
                `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`
            )
          );
        } else if (isDicom(file.name)) {
          imageIds.push(
            cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
          );
        } else {
          imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
        }
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
  }, [files, close, dispatch]);

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
