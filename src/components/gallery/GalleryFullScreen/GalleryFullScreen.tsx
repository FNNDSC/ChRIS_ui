import * as React from "react";
import { Button } from "@patternfly/react-core";
import { ExpandIcon, CompressIcon } from "@patternfly/react-icons";
import "./GalleryFullScreen.scss";
type AllProps = {
    isFullscreen: boolean;
    onFullScreenGallery: () => void;
}

const GalleryFullScreen: React.FunctionComponent<AllProps> = (props: AllProps) => {
    return (
        <div className="fullscreen">
            <Button variant="link"
                    onClick={props.onFullScreenGallery} >
                  { props.isFullscreen ?  <CompressIcon size="md" /> : <ExpandIcon size="md" />}
            </Button>
        </div>
    )
}
export default React.memo(GalleryFullScreen);
