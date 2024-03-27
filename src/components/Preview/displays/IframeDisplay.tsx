import React, { Fragment } from "react";
import { IFileBlob } from "../../../api/model";
type AllProps = {
  fileItem: IFileBlob;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;

  let url = "";

  if (fileItem.fileType === "html") {
    url = fileItem.url
      ? fileItem.url
      : fileItem.blob
        ? window.URL.createObjectURL(
            new Blob([fileItem.blob], { type: "text/html" }),
          )
        : "";
  } else {
    url = fileItem.url
      ? fileItem.url
      : fileItem.blob
        ? window.URL.createObjectURL(new Blob([fileItem.blob]))
        : "";
  }

  return (
    <Fragment>
      <div className="iframe-container">
        <iframe
          id="myframe"
          key={fileItem?.file?.data.fname}
          src={url}
          width="100%"
          height="100%"
          title="Gallery"
        />
      </div>
    </Fragment>
  );
};

const MemoedIframeDisplay = React.memo(IframeDisplay);

export default MemoedIframeDisplay;
