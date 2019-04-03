import * as React from "react";
import JSONPretty from "react-json-pretty";
import { IFileState } from "../../../api/models/file-explorer";

type AllProps = {
  file: IFileState;
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
