import React, { useEffect, useState } from "react";
import type { IFileBlob } from "../../../api/model";

type AllProps = {
  selectedFile?: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = ({ selectedFile }) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    async function constructUrl() {
      // Check if the selectedFile has a direct URL
      if (selectedFile?.url) {
        setUrl(selectedFile.url);
      } else {
        // Get the Blob if the file doesn't have a URL
        const blob = await selectedFile?.getFileBlob();
        if (blob) {
          // Create a Blob URL with the correct MIME type for images
          const objectUrl = window.URL.createObjectURL(
            new Blob([blob], { type: "image/png" }),
          );
          setUrl(objectUrl);

          // Cleanup the object URL to avoid memory leaks
          return () => {
            URL.revokeObjectURL(objectUrl);
          };
        }
      }
    }

    constructUrl();
  }, [selectedFile]);

  // Don't render if the URL isn't ready
  if (!url) return null;

  return (
    <img
      id={selectedFile?.data.fname || ""}
      src={url}
      alt={selectedFile?.data.fname || "image"}
      onClick={(e) => e.preventDefault()} // Prevent default behavior on click
      onKeyDown={(e) => e.preventDefault()}
      style={{ maxWidth: "100%", height: "auto" }} // Responsive styling
    />
  );
};

const MemoedImageDisplay = React.memo(ImageDisplay);

export default MemoedImageDisplay;
