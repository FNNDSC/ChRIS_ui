import { type CSSProperties, useEffect, useRef, useState } from "react";
import { getFileExtension, type IFileBlob } from "../../../api/model";
import styles from "./ImageDisplay.module.css";

type Props = {
  selectedFile?: IFileBlob;
  isHide?: boolean;
};

export default (props: Props) => {
  const { selectedFile, isHide } = props;
  const [url, setUrl] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgClassName, setImgClassName] = useState("img-height-dominant");

  useEffect(() => {
    if (isHide) {
      return;
    }

    if (!selectedFile) {
      return;
    }

    const fileType = getFileExtension(selectedFile.data.fname).toLowerCase();
    if (fileType !== "png" && fileType !== "jpg" && fileType !== "jpeg") {
      return;
    }

    let objectUrl: string | null = null;

    const constructUrl = async () => {
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
    };

    constructUrl();

    // Cleanup the object URL to avoid memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile, isHide]);

  useEffect(() => {
    if (!url) {
      return;
    }
    if (!imgRef.current) {
      return;
    }
    if (!containerRef.current) {
      return;
    }

    // XXX use setTimeout 100ms to get the naturalWidth and naturalHeight for the images.
    setTimeout(() => {
      if (
        !imgRef.current ||
        !imgRef.current.naturalWidth ||
        !imgRef.current.naturalHeight ||
        !containerRef.current ||
        !containerRef.current.clientWidth ||
        !containerRef.current.clientHeight
      ) {
        return;
      }

      const containerImgWidthRatio =
        containerRef.current.clientWidth / imgRef.current.naturalWidth;

      const containerImgHeightRatio =
        containerRef.current.clientHeight / imgRef.current.naturalHeight;

      if (containerImgWidthRatio < containerImgHeightRatio) {
        setImgClassName("img-width-dominant");
      } else {
        setImgClassName("img-height-dominant");
      }
    }, 100);
  }, [
    imgRef.current?.naturalWidth,
    imgRef.current?.naturalHeight,
    url,
    containerRef.current?.clientWidth,
    containerRef.current?.clientHeight,
  ]);

  // Don't render if the URL isn't ready
  if (!url) return null;

  // Calculate image dimensions based on container size
  const divStyle: CSSProperties = {};
  if (isHide) {
    divStyle.display = "none";
  }

  return (
    <div ref={containerRef} className={styles["img-div"]} style={divStyle}>
      <img
        className={styles[imgClassName]}
        ref={imgRef}
        src={url}
        alt={selectedFile?.data.fname}
        onClick={(e) => e.preventDefault()} // Prevent default behavior on click
        onKeyDown={(e) => e.preventDefault()}
      />
    </div>
  );
};
