import React, { useRef } from "react";
import Wrapper from "../../containers/Layout/PageWrapper";
import { Button } from "antd";
import { AiOutlineUpload } from "react-icons/ai";
import { ModalVariant, Modal } from "@patternfly/react-core";

const VisualizationPage = () => {
  const fileOpen = useRef<HTMLInputElement>(null);
  const folderOpen = useRef<HTMLInputElement>(null);
  const handleOpenFolder = (files: any) => {
    console.log("Files", files);
  };

  const handleOpenLocalFs = (files: any) => {
    console.log("Files", files);
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
      <div>
        <Button onClick={showOpenFolder} icon={<AiOutlineUpload />}>
          Upload a Directory
        </Button>
        <Button onClick={showOpenFile} icon={<AiOutlineUpload />}>
          Upload Files
        </Button>
      </div>
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
