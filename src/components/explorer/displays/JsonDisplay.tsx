import React, { useState, useEffect, useRef } from "react";

import { IGalleryItem } from "../../../api/models/gallery.model";
import ReactJSON from "react-json-view";

type AllProps = {
  galleryItem: IGalleryItem;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const [blobText, setBlobText] = useState({});
  const { galleryItem } = props;
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
    if (!!galleryItem.blob) {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        if (_isMounted.current === true) setBlobText(JSON.parse(blobText));
      });
      reader.readAsText(galleryItem.blob);
    }
  };
  getBlobText();

  return (
    <div className="json-display">
      {blobText && (
        <ReactJSON
          name={false}
          displayDataTypes={false}
          src={blobText}
          displayObjectSize={false}
          style={{
            fontSize: "16px",
          }}
          collapsed={true}
        />
      )}
    </div>
  );
};

export default React.memo(JsonDisplay);
