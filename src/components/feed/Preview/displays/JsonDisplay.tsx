import React, { useState, useEffect, useRef } from "react";
import ReactJSON from "react-json-view";
import { Text } from "@patternfly/react-core";
import { IFileBlob } from "../../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const [blobText, setBlobText] = useState({});
  const { fileItem } = props;
  const _isMounted = useRef(false);

  const getBlobText = React.useCallback(() => {
    const { blob } = fileItem;
    if (blob) {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        if (_isMounted.current === true) setBlobText(JSON.parse(blobText));
      });
      reader.readAsText(blob);
    }
  }, [fileItem]);

  useEffect(() => {
    _isMounted.current = true;
    getBlobText();

    return () => {
      _isMounted.current = false;
    };
  }, [getBlobText]);

  getBlobText();

  return (
    <>
      {blobText ? (
        <ReactJSON
          name={false}
          displayDataTypes={false}
          src={blobText}
          displayObjectSize={false}
          collapsed={false}
        />
      ) : (
        <Text component="p">Could not load json payload at the moment....</Text>
      )}
    </>
  );
};

export default React.memo(JsonDisplay);
