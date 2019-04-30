import * as React from "react";
import { Grid, GridItem} from "@patternfly/react-core";
import IDcmSeriesItem from "../../../api/models/dcm.model";
import "./DcmInfoPanel.scss";
type AllProps = {
    seriesItem: IDcmSeriesItem;
};

const DcmInfoPanel: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const { seriesItem } = props;
    return (
        <Grid className="dcm-info">
            <GridItem sm={12} md={6}>
                <div><label>Study Description / date: </label>{seriesItem.studyDescription} {seriesItem.studyDate}</div>
                <div><label>Series Description: </label>{seriesItem.seriesDescription}</div>
                <div><label>Study Date: </label> {seriesItem.studyDate}</div>
            </GridItem>
            <GridItem className="right" sm={12} md={6}>
                <div><label>Patient Name: </label>{seriesItem.patientName}</div>
                <div><label>Patient ID: </label> {seriesItem.patientID}</div>
                <div>{`(age: ${seriesItem.patientAge} - dob:  ${seriesItem.patientBirthdate})`}</div>
            </GridItem>
         </Grid>
    )
}
export default React.memo(DcmInfoPanel);
