import { type CSSProperties, useEffect, useState } from "react";
import type { IFileBlob } from "../../../api/model";

type Props = {
  selectedFile?: IFileBlob;
  isHide?: boolean;
};

export default (props: Props) => {
  const { selectedFile, isHide } = props;
  const [url, setUrl] = useState<string>("");
  const [sourceType, setSourceType] = useState<string>("");

  useEffect(() => {
    (async () => {
      const blob = await selectedFile?.getFileBlob();
      if (blob) {
        const objectUrl = window.URL.createObjectURL(
          new Blob([blob], { type: blob.type }),
        );
        setUrl(objectUrl);
        setSourceType(blob.type);

        // Clean up the object URL when the component unmounts
        return () => {
          window.URL.revokeObjectURL(objectUrl);
        };
      }
    })();
  }, [selectedFile]);

  const style: CSSProperties = {};
  if (isHide) {
    style.display = "none";
  }

  return (
    // biome-ignore lint/a11y/useMediaCaption: jsx
    <video controls width="90%" height="90%" style={style}>
      <source src={url} type={sourceType} />
      {/* Fallback message for browsers that do not support video playback */}
      Your browser does not support the video tag.
    </video>
  );
};
