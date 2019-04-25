import * as React from "react";
import { CloseIcon } from "@patternfly/react-icons";
import { Button } from "@patternfly/react-core";
import { IGalleryItem } from "../../../api/models/gallery.model";
import "./GalleryInfoPanel.scss";
type AllProps = {
    galleryItem?: IGalleryItem;
    toggleViewerMode: () => void;
};

const GalleryInfoPanel: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const {galleryItem} = props;
    return (
        <div className="gallery-info">
            <Button
                className="close-btn"
                variant="link"
                onClick={props.toggleViewerMode} ><CloseIcon size="md" />
            </Button>
           {
               !!galleryItem && <div>
                <p>File name: {galleryItem.fileName}</p>
            </div>
        }
        </div>
    )
}
export default React.memo(GalleryInfoPanel);
