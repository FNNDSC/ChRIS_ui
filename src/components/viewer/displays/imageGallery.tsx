import * as React from "react";
import { IFeedFile } from "../../../api/models/feed-file.model";



type AllProps = {
    files: IFeedFile[];
};


const ImageGallery: React.FunctionComponent<AllProps> = (props: AllProps) => {
    console.log(props.files);
    return (
        <div>Gallery goes here</div>
    )
}

export default React.memo(ImageGallery);
