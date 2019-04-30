import * as React from "react";
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
class PluginOutput extends React.Component<AllProps, { isModalOpen: boolean }> {
  state = {
    isModalOpen: false
  };
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  parseFilesLabel = (filesArr: any[]): string => {
    return `${filesArr.length} ${filesArr.length === 1 ? "file" : "files"}`;
  };

  // Description: Handle key down to open modal ctrl+zZ
  handleKeyDown = (event: KeyboardEvent) => {
    (event.keyCode === 90 && event.ctrlKey) && this.handleModalToggle();
  }

  // Set local state
  handleModalToggle = () => {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  };

  render() {
    const { files, handleDownloadData } = this.props;
    return (
      !!files && (
        <React.Fragment>
          <div>
            <label>Data:</label>
            {!files.length ? (
              <span>
                <ExclamationCircleIcon color="#007bba" /> No files found
              </span>
            ) : (
              this.parseFilesLabel(files)
            )}
          </div>
          {files.length > 0 && (
            <div className="btn-div">
              <Button variant="secondary" isBlock onClick={handleDownloadData}>
                <DownloadIcon /> Download Data
              </Button>
              <Button
                variant="secondary"
                isBlock
                onClick={this.handleModalToggle} >
                <EyeIcon /> View Data
              </Button>
            </div>
          )}
          <PluginViewerModal
            isModalOpen={this.state.isModalOpen}
            handleModalToggle={this.handleModalToggle}
          />
        </React.Fragment>
      )
    );
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
}

export default React.memo(PluginOutput);
