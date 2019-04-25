import React, {useState} from "react";
import JSONPretty from "react-json-pretty";
import { IGalleryItem } from "../../../api/models/gallery.model";

type AllProps = {
  file: IGalleryItem;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const [blobText, setBlobText] = useState(undefined);
  const { file } = props;
  const getBlobText = () => {
    if (!!file.blob) {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e: any) => {
        const blobText = e.target.result;
        setBlobText(blobText);
      });
      reader.readAsText(file.blob);
    }
  };
  getBlobText();
  return (
    <div className="json-display">
     {!!blobText && <JSONPretty data={blobText} />}
    </div>
  );
};

export default React.memo(JsonDisplay);
