import * as React from "react";
// import { IFileBlob } from "../../../api/models/file-viewer.model";
import { IGalleryItem } from "../../../api/models/gallery.model";
import {
    CatchallDisplay,
    JsonDisplay,
    IframeDisplay,
    ImageDisplay,
    DcmDisplay
} from "./index";



type AllProps = {
    tag: string;
    file: IGalleryItem;
}

class ViewerDisplay extends React.Component<AllProps> {
    components = {
        JsonDisplay,
        IframeDisplay,
        ImageDisplay,
        DcmDisplay,
        CatchallDisplay
    };
    render() {
        const TagName = (this.components as any)[this.props.tag || "CatchallDisplay"];
        const { file } = this.props;
        // console.log(file.blob);
        return <TagName file={file} />
    }
}
export default ViewerDisplay;
