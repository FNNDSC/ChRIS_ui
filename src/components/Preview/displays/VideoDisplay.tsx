import { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const VideoDisplay = (props: AllProps) => {
  const { fileItem } = props;
  const { url, fileType } = fileItem;
  const sourceType = `video/${fileType}`;

  return (
    // biome-ignore lint/a11y/useMediaCaption: <explanation>
    <video controls width="90%" height="90%">
      <source src={url} type={sourceType} />
      {/* Fallback message for browsers that do not support video playback */}
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoDisplay;
