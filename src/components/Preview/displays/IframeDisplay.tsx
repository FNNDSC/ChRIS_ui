import React, { Fragment } from "react";
import { IFileBlob } from "../../../api/model";
import { EmptyStateComponent } from "../../Common";

type AllProps = {
  fileItem: IFileBlob;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  return (
    <Fragment>
      <div className="iframe-container">
        {fileItem.url ? (
          <iframe
            id="myframe"
            key={fileItem?.file?.data.fname}
            src={fileItem.url}
            width="100%"
            height="100%"
            title="Gallery"
          />
        ) : (
          <EmptyStateComponent title="Failed to load this file..." />
        )}
      </div>
    </Fragment>
  );
};

export default IframeDisplay;
