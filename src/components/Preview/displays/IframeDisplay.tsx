import React, { Fragment, useEffect, useState } from "react";
import { IFileBlob } from "../../../api/model";
import ChrisAPIClient from "../../../api/chrisapiclient";
import { SpinContainer } from "../../Common";
type AllProps = {
  fileItem: IFileBlob;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function fetchUrl() {
      let url = "";
      const client = ChrisAPIClient.getClient();
      const token = await client.createDownloadToken();
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
      setUrl(`${url}?${token}`);
    }

    fetchUrl();
  }, []);

  return (
    <Fragment>
      <div className="iframe-container">
        {url ? (
          <iframe
            id="myframe"
            key={fileItem?.file?.data.fname}
            src={url}
            width="100%"
            height="100%"
            title="Gallery"
          />
        ) : (
          <SpinContainer title="Please wait a moment..." />
        )}
      </div>
    </Fragment>
  );
};

const MemoedIframeDisplay = React.memo(IframeDisplay);

export default MemoedIframeDisplay;
