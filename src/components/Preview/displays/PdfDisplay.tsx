import React, { useEffect, useState } from "react";
import type { IFileBlob } from "../../../api/model";

type AllProps = {
  selectedFile?: IFileBlob;
};

const PdfDisplay: React.FC<AllProps> = ({ selectedFile }: AllProps) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    async function constructURL() {
      if (selectedFile?.url) {
        setUrl(selectedFile.url);
      } else {
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
    }

    constructURL();
  }, [selectedFile]);

  if (!url) return null;

  return (
    <div className="iframe-container">
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

export default React.memo(PdfDisplay);
