import React, {useState} from "react";
import { Button } from "@patternfly/react-core";
import {
  ExclamationCircleIcon,
  EyeIcon,
  DownloadIcon
} from "@patternfly/react-icons";
import { IFeedFile } from "../../api/models/feed-file.model";
import PluginViewerModal from "./PluginViewerModal";

type AllProps = {
  files: IFeedFile[];
  handleDownloadData: () => void;
  handleViewData: () => void;
};

const PluginOutput: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const parseFilesLabel = (filesArr: any[]): string => {
    return `${filesArr.length} ${filesArr.length === 1 ? "file" : "files"}`;
  };

  // Set local state hook
  const [isModalOpen, setValue] = useState(false); // Temp - set to false
  const handleModalToggle = () => {
    setValue(!isModalOpen);
  };

  return (
    !!props.files && (
      <React.Fragment>
        <div>
          <label>Data:</label>
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
            <Button variant="secondary" isBlock onClick={handleModalToggle}>
              <EyeIcon /> View Data
            </Button>
          </div>
        )}
        <PluginViewerModal isModalOpen={isModalOpen} handleModalToggle={handleModalToggle}  />
      </React.Fragment>
    )
  );
};

export default React.memo(PluginOutput);
