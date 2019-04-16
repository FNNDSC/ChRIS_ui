import * as React from "react";
// import { ChevronLeftIcon, ChevronRightIcon } from "@patternfly/react-icons";

type AllProps = {
    param: any;
}

const GalleryToolbar: React.FunctionComponent<AllProps> = (props: AllProps) => {
    // Description: will move images to previous or next in the gallery object
    const handlePlay = (indexOffset: number) => {
        console.log("handlePlay", indexOffset);
    }

    return (
      <div className="toolbar"> HI, I am Toolbar</div>
    )
}
export default React.memo(GalleryToolbar);
