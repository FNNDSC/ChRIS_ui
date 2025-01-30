import React, { useEffect, useState, useRef } from "react";
import type { IFileBlob } from "../../../api/model";
import { getFileExtension } from "../../../api/model";
import useSize from "../../FeedTree/useSize";

type AllProps = {
  fileItem: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const [url, setUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(containerRef);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (fileItem.url) {
      setUrl(fileItem.url);
    } else if (fileItem.blob) {
      // Specify the correct MIME type when creating the Blob
      const blob = new Blob([fileItem.blob], { type: "image/png" });
      if (blob) {
        let type = "";
        const fileType = getFileExtension(
          fileItem.file?.data.fname,
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

      // Clean up the object URL when the component unmounts
      // Cleanup the object URL to avoid memory leaks
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }
  }, [fileItem]);

  if (!url) return null;
  // Calculate image dimensions based on container size
  const imageStyles: React.CSSProperties = {
    //@ts-ignore
    width: size ? `${size.width}px` : "100%",
    height: "auto",
    objectFit: "scale-down",
    transition: "width 0.2s, height 0.2s",
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <img
        id={fileItem.file?.data.fname || ""}
        src={url}
        alt={fileItem.file?.data.fname}
        onClick={(e) => e.preventDefault()} // Prevent default behavior on click
        onKeyDown={(e) => e.preventDefault()}
        style={imageStyles} // Apply dynamic styles
      />
    </div>
  );
};

const ImageDisplayMemoed = React.memo(ImageDisplay);

export default ImageDisplayMemoed;
