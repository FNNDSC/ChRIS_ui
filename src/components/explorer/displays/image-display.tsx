import React, { createRef } from "react";
import { Button } from "@patternfly/react-core";
import { IFileState } from "../../../api/models/file-explorer";
import { ArrowsAltIcon } from "@patternfly/react-icons";
type AllProps = {
  file: IFileState;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const imageRef = createRef<HTMLDivElement>();
  const { file } = props;
  const url = !!file.blob
    ? window.URL.createObjectURL(new Blob([file.blob]))
    : "";
  const fullscreenImage = (elem: any) => {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };
  return (
    <div className="image-block">
      <Button variant="link"
        onClick={() => {fullscreenImage(imageRef.current); }} ><ArrowsAltIcon size="md" /></Button>
      <div ref={imageRef} className="tofullscreen" >
        <img id="test" src={url} />
      </div>
    </div>
  );
};

export default React.memo(ImageDisplay);
