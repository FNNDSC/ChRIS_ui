import { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const VideoDisplay = (props: AllProps) => {
  const { fileItem } = props;
  const { blob, url, fileType } = fileItem;
  const urlToFetch = url
    ? url
    : blob
      ? window.URL.createObjectURL(new Blob([blob], { type: blob.type }))
      : "";
  const sourceType = url ? fileType : blob ? blob.type : "";

  return (
    // biome-ignore lint/a11y/useMediaCaption: <explanation>
    <video controls width="90%" height="90%">
      <source src={urlToFetch} type={`video/${sourceType}`} />
      {/* Fallback message for browsers that do not support video playback */}
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoDisplay;
