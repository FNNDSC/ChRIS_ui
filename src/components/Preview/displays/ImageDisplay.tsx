import React, { useEffect, useState, useRef } from "react";
import { getFileExtension, type IFileBlob } from "../../../api/model";
import useSize from "../../FeedTree/useSize";

type AllProps = {
  selectedFile?: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = ({ selectedFile }) => {
  const [url, setUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(containerRef); // Get the dimensions of the container

  useEffect(() => {
    let objectUrl: string | null = null;

    async function constructUrl() {
      if (!selectedFile) {
        setUrl("");
        return;
      }

      try {
        // Get the Blob if the file doesn't have a URL
        const blob = await selectedFile.getFileBlob();
        if (blob) {
          let type = "";
          const fileType = getFileExtension(
            selectedFile.data.fname,
          ).toLowerCase();
          if (fileType === "png") {
            type = "image/png";
          } else if (fileType === "jpg" || fileType === "jpeg") {
            type = "image/jpeg";
          } else {
            // use antd notifications here
            // Handle unsupported file types if necessary
            console.warn(`Unsupported file type: ${fileType}`);
            return;
          }

          // Create a Blob URL with the correct MIME type for images
          objectUrl = window.URL.createObjectURL(new Blob([blob], { type }));
          setUrl(objectUrl);
        }
      } catch (error) {
        console.error("Error constructing image URL:", error);
      }
    }

    constructUrl();

    // Cleanup the object URL to avoid memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  // Don't render if the URL isn't ready
  if (!url) return null;

  // Calculate image dimensions based on container size
  const imageStyles: React.CSSProperties = {
    width: size ? `${size.width}px` : "100%",
    height: "auto",
    objectFit: "scale-down",
    transition: "width 0.2s, height 0.2s",
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <img
        id={selectedFile?.data.fname || ""}
        src={url}
        alt={selectedFile?.data.fname}
        onClick={(e) => e.preventDefault()} // Prevent default behavior on click
        onKeyDown={(e) => e.preventDefault()}
        style={imageStyles} // Apply dynamic styles
      />
    </div>
  );
};

const MemoedImageDisplay = React.memo(ImageDisplay);

export default MemoedImageDisplay;
