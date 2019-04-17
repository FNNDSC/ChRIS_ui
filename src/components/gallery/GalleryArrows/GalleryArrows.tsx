import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@patternfly/react-icons"
import "./GalleryArrows.scss";
type AllProps = {
    param: any;
    onSlideChange: (offset: number) => void;
}

const GalleryArrows: React.FunctionComponent<AllProps> = (props: AllProps) => {
    return (
        <div className="arrows">
            <a className="prev" onClick={() => props.onSlideChange(-1)}><span className="pf-u-screen-reader">Previous</span><ChevronLeftIcon color="white" /></a>
            <a className="next" onClick={() => props.onSlideChange(1)}><span className="pf-u-screen-reader">Next</span><ChevronRightIcon color="white" /></a>
        </div>
    )
}
export default React.memo(GalleryArrows);
