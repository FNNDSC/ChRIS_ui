// import * as React from "react";
import React, {useState} from "react";
import { Button } from "@patternfly/react-core";
import {
  ExclamationCircleIcon,
  EyeIcon,
  DownloadIcon
} from "@patternfly/react-icons";
import PluginViewerModal from "./PluginViewerModal";

type AllProps = {
  files: any[];
  handleDownloadData: () => void;
  handleViewData: () => void;
};

const PluginOutput: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const parseFilesLabel = (filesArr: any[]): string => {
    return `${filesArr.length} ${filesArr.length === 1 ? "file" : "files"}`;
  };
  const [isModalOpen, setValue] = useState(false);
  const handleAddValue = () => {
    setValue(!isModalOpen);
  };

  return (
    !!props.files && (
      <React.Fragment>
        <div>
          <label>Data:</label>{" "}
          {!props.files.length ? (
            <span>
              <ExclamationCircleIcon color="#007bba" /> No files found
            </span>
          ) : (
            parseFilesLabel(props.files)
          )}
        </div>
        {props.files.length > 0 && (
          <div className="btn-div">
            <Button
              variant="secondary"
              isBlock
              onClick={props.handleDownloadData} >
              <DownloadIcon /> Download Data
            </Button>
            <Button variant="secondary" isBlock onClick={handleAddValue}>
              <EyeIcon /> View Data
            </Button>
          </div>
        )}
        <PluginViewerModal isModalOpen={isModalOpen} handleModalToggle={handleAddValue}  />
      </React.Fragment>
    )
  );
};

export default React.memo(PluginOutput);
