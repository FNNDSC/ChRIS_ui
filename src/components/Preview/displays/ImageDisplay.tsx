import React, { useEffect, useState } from "react";
import type { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (fileItem.url) {
      setUrl(fileItem.url);
    } else if (fileItem.blob) {
      // Specify the correct MIME type when creating the Blob
      const blob = new Blob([fileItem.blob], { type: "image/png" });
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);

      // Clean up the object URL when the component unmounts
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [fileItem]);

  if (!url) return null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <img
      id={fileItem.file ? fileItem.file.data.fname : ""}
      src={url}
      alt=""
      // Prevent default behavior on click
      onClick={(e) => e.preventDefault()}
    />
  );
};

const ImageDisplayMemoed = React.memo(ImageDisplay);

export default ImageDisplayMemoed;
