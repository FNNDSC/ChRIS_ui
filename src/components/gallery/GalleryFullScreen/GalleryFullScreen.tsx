import * as React from "react";
import { Button } from "@patternfly/react-core";
import { ExpandIcon } from "@patternfly/react-icons";
import "./GalleryFullScreen.scss";
type AllProps = {
    elementRef: any;
}

const GalleryFullScreen: React.FunctionComponent<AllProps> = (props: AllProps) => {
    // Description: will make the view full screen
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
        <div className="fullscreen">
         <Button variant="link"
                onClick={() => { fullscreenImage(props.elementRef); }} ><ExpandIcon size="md" /></Button>
        </div>
    )
}
export default React.memo(GalleryFullScreen);
