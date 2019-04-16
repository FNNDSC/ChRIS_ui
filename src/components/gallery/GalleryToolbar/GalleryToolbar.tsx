import * as React from "react";
import { Button } from "@patternfly/react-core";
import { PlayIcon, PauseIcon, StepForwardIcon, StepBackwardIcon } from "@patternfly/react-icons";
import "./GalleryToolbar.scss";
type AllProps = {
    isPlaying: boolean;
    onSlideChange: () => void;
}

const GalleryToolbar: React.FunctionComponent<AllProps> = (props: AllProps) => {
    // Description: will move items to previous or next in the gallery object
    const handleClick = () => { // Working
       // console.log("handleClick", handleClick);
    }
    return (
        <div className="gallery-toolbar">
            <Button variant="link"
                onClick={handleClick} >
                <StepBackwardIcon />
            </Button>
            {props.isPlaying ?
                <Button variant="link"
                    onClick={handleClick} >
                    <PauseIcon size="md" />
                </Button> :
                <Button variant="link"
                    onClick={handleClick} >
                    <PlayIcon size="md" />
                </Button>
            }
            <Button variant="link"
                onClick={handleClick} >
                <StepForwardIcon  />
            </Button>
        </div>
    )
}
export default React.memo(GalleryToolbar);
