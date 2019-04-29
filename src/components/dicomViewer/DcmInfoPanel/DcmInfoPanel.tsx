import * as React from "react";
import "./DcmInfoPanel.scss";
type AllProps = {
    seriesItem?: any;
};

const DcmInfoPanel: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const { seriesItem } = props;
    return (
        <div className="dcm-info">
            {!!seriesItem &&
                <React.Fragment>
                    <p>Patient Name: {seriesItem.patientName}</p>
                    {/* Add more metadata here */}
                </React.Fragment>}
        </div>
    )
}
export default React.memo(DcmInfoPanel);
