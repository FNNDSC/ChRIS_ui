import React, { useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import Wrapper from "../Layout/PageWrapper";
import { Button } from "antd";
import { AiOutlineUpload } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { setSidebarActive } from "../../store/ui/actions";
import { useDropzone } from "react-dropzone";
import { setExternalFiles } from "../../store/explorer/actions";
import { PageSection } from "@patternfly/react-core";
import InfoIcon from "../../components/common/info/InfoIcon";
import { Typography } from "antd";
const { Paragraph } = Typography;

const infoStyle = { fontSize: "1.15em" };

const btnStyle = { marginRight: "10px" };

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
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "DICOM Viewer";
    if (acceptedFiles.length > 0) dispatch(setExternalFiles(acceptedFiles));
  }, [acceptedFiles, dispatch]);

  const close = React.useCallback(() => {
    navigate("/gallery");
  }, [navigate]);

  React.useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "visualizations",
      })
    );
  }, [dispatch]);

  const handleOpenFolder = (files: any) => {
    dispatch(setExternalFiles(files));
    close();
  };
  const handleOpenLocalFs = (files: any) => {
    dispatch(setExternalFiles(files));
    close();
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

  return (
    <Wrapper>
      <PageSection variant="light">
        <InfoIcon
          title="DICOM Viewer"
          p1={
            <Paragraph style={infoStyle}>
              The DICOM Viewer is a convenient way to visualize DICOM images as
              a stack in your web browser without having to install any
              programs.
            </Paragraph>
          }
        />
      </PageSection>

      <PageSection>
        <Button
          onClick={showOpenFolder}
          icon={<AiOutlineUpload />}
          style={btnStyle}>
          Upload a Directory
        </Button>
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload Files
        </Button>

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
      </PageSection>
    </Wrapper>
  );
};

export default VisualizationPage;
