import React, { useEffect, useState } from "react";
import type { IFileBlob } from "../../../api/model";

type AllProps = {
  selectedFile?: IFileBlob;
};

const VideoDisplay: React.FC<AllProps> = ({ selectedFile }: AllProps) => {
  const [url, setUrl] = useState<string>("");
  const [sourceType, setSourceType] = useState<string>("");

  useEffect(() => {
    async function constructURL() {
      if (selectedFile?.url) {
        setUrl(selectedFile.url);
        setSourceType(`video/${selectedFile.data.fname.split(".").pop()}`);
      } else {
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
      }
    }

    constructURL();
  }, [selectedFile]);

  if (!url) return null;

  return (
    // biome-ignore lint/a11y/useMediaCaption: <explanation>
    <video controls width="90%" height="90%">
      <source src={url} type={sourceType} />
      {/* Fallback message for browsers that do not support video playback */}
      Your browser does not support the video tag.
    </video>
  );
};

export default React.memo(VideoDisplay);
