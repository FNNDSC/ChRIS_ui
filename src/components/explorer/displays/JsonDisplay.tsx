import React, { useState } from "react";

import { IGalleryItem } from "../../../api/models/gallery.model";
import ReactJSON from "react-json-view";

type AllProps = {
  galleryItem: IGalleryItem;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const [blobText, setBlobText] = useState({});
  const { galleryItem } = props;
  const getBlobText = () => {
    if (!!galleryItem.blob) {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        setBlobText(JSON.parse(blobText));
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
        />
      )}
    </div>
  );
};

export default React.memo(JsonDisplay);
