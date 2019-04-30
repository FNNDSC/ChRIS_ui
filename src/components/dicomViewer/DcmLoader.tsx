import * as React from "react";
import { LoadingComponent } from "..";

interface ILoadingProps {
    totalParsed: number;
    totalFiles: number;
}

const DcmLoader: React.FunctionComponent<any> = (props: ILoadingProps) => {
    return (<div className="loader">
        <LoadingComponent color="#fff" isLocal />
        {`${props.totalParsed} of ${props.totalFiles} loaded`}
    </div>
    )
};

export default DcmLoader;
