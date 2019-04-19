import * as React from "react";
import { IFileState } from "../../../api/models/file-viewer.model";
import {
    CatchallDisplay,
    JsonDisplay,
    IframeDisplay,
    ImageDisplay,
    DcmDisplay
} from "./index";


type AllProps = {
    tag: string;
    file: IFileState;
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
        return <TagName file={file} />
    }
}
export default ViewerDisplay;
