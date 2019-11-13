import React, { useState } from "react";
import JSONPretty from "react-json-pretty";
import { IGalleryItem } from "../../../api/models/gallery.model";

type AllProps = {
  galleryItem: IGalleryItem;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const [blobText, setBlobText] = useState(undefined);
  const { galleryItem } = props;
  const getBlobText = () => {
    if (!!galleryItem.blob) {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        setBlobText(blobText);
      });
      reader.readAsText(galleryItem.blob);
    }
  };
  getBlobText();
  console.log("Called");
  return (
    <div className="json-display">
      {!!blobText && <JSONPretty data={blobText} />}
    </div>
  );
};

export default React.memo(JsonDisplay);
