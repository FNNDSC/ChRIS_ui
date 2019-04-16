import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@patternfly/react-icons"
import "./GalleryArrows.scss";
type AllProps = {
    param: any;
}

const GalleryArrows: React.FunctionComponent<AllProps> = (props: AllProps) => {
    // Description: will move images to previous or next in the gallery object
    const handlePlay = (indexOffset: number) => {
        console.log("handlePlay", indexOffset);
    }

    return (
        <div className="arrows">
            <a className="prev" onClick={() => handlePlay(-1)}
            ><span className="pf-u-screen-reader">Previous</span><ChevronLeftIcon color="white" /></a>
            <a className="next" onClick={() => handlePlay(1)}><span className="pf-u-screen-reader">Next</span><ChevronRightIcon color="white" /></a>
        </div>
    )
}
export default React.memo(GalleryArrows);
