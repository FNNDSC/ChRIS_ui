import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";
import React, {
  type CSSProperties,
  Fragment,
  useEffect,
  useState,
} from "react";
import { getFileExtension, type IFileBlob } from "../../../api/model";

type Props = {
  selectedFile?: IFileBlob;
  isHide?: boolean;
};

export default (props: Props) => {
  const { selectedFile, isHide } = props;
  const [url, setURL] = useState<string>("");

  console.info(
    "IframDisplay: isHide:",
    isHide,
    "selectedFile:",
    selectedFile,
    "url:",
    url,
  );

  useEffect(() => {
    if (isHide) {
      return;
    }

    if (!selectedFile) {
      return;
    }

    const constructedURL = { url: "" };
    const constructURL = async () => {
      const fileType = getFileExtension(selectedFile.data.fname);
      const blob = await selectedFile.getFileBlob();

      const type = fileType === "html" ? "text/html" : "";
      constructedURL.url = URL.createObjectURL(new Blob([blob], { type }));
      setURL(constructedURL.url);
    };

    constructURL();
    return () => {
      if (!constructedURL.url) {
        return;
      }
      URL.revokeObjectURL(constructedURL.url);
    };
  }, [selectedFile, isHide]);

  const style: CSSProperties = {};
  if (isHide) {
    style.display = "none";
  }

  return (
    <Fragment>
      <div className="iframe-container" style={style}>
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
