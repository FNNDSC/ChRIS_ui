import * as React from "react";
import { IFileState } from "../../../api/models/file-explorer";

type Props = {
 fileState: IFileState;
};

const JsonDisplay: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <div>{props.fileState.blobName}</div>
    )
}

export default React.memo(JsonDisplay);
