import * as React from "react";
import { LoadingSpinner } from "..";

interface ILoadingProps {
    totalParsed: number;
    totalFiles: number;
}

const DcmLoader: React.FunctionComponent<any> = (props: ILoadingProps) => {
    return (<div className="loader">
        <LoadingSpinner color="#fff" isLocal />
        {`${props.totalParsed} of ${props.totalFiles} loaded`}
    </div>
    )
};

export default DcmLoader;
