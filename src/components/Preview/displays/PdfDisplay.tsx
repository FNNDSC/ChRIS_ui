import { type CSSProperties, useEffect, useState } from "react";
import type { IFileBlob } from "../../../api/model";

type Props = {
  selectedFile?: IFileBlob;
  isHide?: boolean;
};

export default (props: Props) => {
  const { selectedFile, isHide } = props;
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    async function constructURL() {
      if (!selectedFile) return;
      const blob = await selectedFile?.getFileBlob();
      if (blob) {
        const objectUrl = window.URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" }),
        );
        setUrl(objectUrl);

        // Clean up the URL when the component unmounts
        return () => {
          window.URL.revokeObjectURL(objectUrl);
        };
      }
    }

    constructURL();
  }, [selectedFile]);

  const style: CSSProperties = {};
  if (isHide) {
    style.display = "none";
  }

  return (
    <div className="iframe-container" style={style}>
      <iframe
        key={selectedFile?.data.fname}
        src={url}
        width="100%"
        height="100%"
        title="PDF Display"
      />
    </div>
  );
};
