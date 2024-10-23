import React, { useEffect, useState, Fragment } from "react";
import { getFileExtension, type IFileBlob } from "../../../api/model";

type IframeDisplayProps = {
  selectedFile?: IFileBlob;
};

const IframeDisplay: React.FC<IframeDisplayProps> = ({
  selectedFile,
}: IframeDisplayProps) => {
  const [url, setURL] = useState<string>("");

  useEffect(() => {
    const constructURL = async () => {
      if (!selectedFile) return;
      const fileType = getFileExtension(selectedFile.data.fname);
      const blob = await selectedFile.getFileBlob();

      const type = fileType === "html" ? "text/html" : "";
      const constructedURL = URL.createObjectURL(new Blob([blob], { type }));
      setURL(constructedURL);
    };

    constructURL();
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url, selectedFile]);

  return (
    <Fragment>
      <div className="iframe-container">
        <iframe
          id="myframe"
          key={selectedFile?.data.fname}
          src={url}
          width="100%"
          height="100%"
          title="File Display"
        />
      </div>
    </Fragment>
  );
};

export default React.memo(IframeDisplay);
