import * as React from "react";
import { CloseIcon } from "@patternfly/react-icons";
import { Grid, GridItem, Button } from "@patternfly/react-core";
import { IGalleryToolbarState } from "../../../store/gallery/types";
import "./GalleryInfoPanel.scss";
type AllProps = {
    toggleViewerMode: () => void;
};

const GalleryInfoPanel: React.FunctionComponent<AllProps> = (props: AllProps) => {
    return (
        <div className="gallery-info">
                <Button
                    className="float-right"
                    variant="link"
                    onClick={props.toggleViewerMode}  > <CloseIcon size="md" />
                 </Button>
        </div>
    )
}
export default React.memo(GalleryInfoPanel);
