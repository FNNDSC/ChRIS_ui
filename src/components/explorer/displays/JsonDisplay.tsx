import * as React from "react";
import JSONPretty from "react-json-pretty";
import { IFileBlob } from "../../../api/models/file-viewer.model";

type AllProps = {
  file: IFileBlob;
};

const JsonDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;

  return (
    <div className="json-display">
      <JSONPretty data={file.blobText} />
    </div>
  );
};

export default React.memo(JsonDisplay);
