import React, { useState, useEffect, useRef } from "react";
import ReactJSON from "react-json-view";

import { IFileBlob } from "../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const [blobText, setBlobText] = useState({});
  const { fileItem } = props;
  let _isMounted = useRef(false);

  useEffect(() => {
    _isMounted.current = true;
    getBlobText();

    return () => {
      _isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBlobText = () => {
    if (!!fileItem.blob) {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        if (_isMounted.current === true) setBlobText(JSON.parse(blobText));
      });
      reader.readAsText(fileItem.blob);
    }
  };
  getBlobText();

  return (
    <>
      {blobText ? (
        <ReactJSON
          name={false}
          displayDataTypes={false}
          src={blobText}
          displayObjectSize={false}
          style={{
            fontSize: "16px",
          }}
          collapsed={false}
        />
      ) : (
        <div></div>
      )}
    </>
  );
};

export default React.memo(JsonDisplay);
