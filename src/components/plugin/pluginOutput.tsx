import * as React from "react";
import { Button } from "@patternfly/react-core";
import { EyeIcon, DownloadIcon } from "@patternfly/react-icons";

type AllProps = {
  files: any[];
  handleDownloadData: () => void;
  handleViewData: () => void;
};

const PluginOutput: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    !!props.files && (
      <React.Fragment>
        <div>
          <label>Data:</label> 18 files (156.1MB)
        </div>
        <div className="btn-div">
          <Button variant="secondary" isBlock onClick={props.handleDownloadData}>
            <DownloadIcon /> Download Data
          </Button>
          <Button variant="secondary" isBlock onClick={props.handleViewData}>
            <EyeIcon /> View Data
          </Button>
        </div>
      </React.Fragment>
    )
  );
};

export default React.memo(PluginOutput);
