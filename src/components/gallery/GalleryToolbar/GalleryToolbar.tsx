import * as React from "react";
import { Button } from "@patternfly/react-core";
import { PlayIcon, PauseIcon, StepForwardIcon, StepBackwardIcon } from "@patternfly/react-icons";
import "./GalleryToolbar.scss";
type AllProps = {
    isPlaying: boolean;
    onToolbarClick: (isPlay: boolean) => void; // Description: switch play/pause functionality
}

const GalleryToolbar: React.FunctionComponent<AllProps> = (props: AllProps) => {

    return (
        <div className="gallery-toolbar">
            {props.isPlaying ?
                <Button variant="link"
                    onClick={() => props.onToolbarClick(true)} >
                    <PauseIcon size="md" />
                </Button> :
                <Button variant="link"
                    onClick={() => props.onToolbarClick(false)} >
                    <PlayIcon size="md" />
                </Button>
            }
        </div>
    )
}
export default React.memo(GalleryToolbar);
