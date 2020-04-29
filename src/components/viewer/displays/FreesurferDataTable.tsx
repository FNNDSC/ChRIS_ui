import * as React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { FeedFile } from "@fnndsc/chrisapi";
import { lhData } from "../../../assets/temp/lh.aparc.a2009s";
import { rhData } from "../../../assets/temp/rh.aparc.a2009s";
import "./freesurferData.scss";
import _ from "lodash";
type AllProps = {
  files: FeedFile[];
};

interface IfsRow {
  StructName: string;
  NumVert: number;
  SurfArea: number;
  GrayVol: number;
  ThickAvg: number;
  ThickStd: number;
  MeanCurv: number;
  GausCurv: number;
  FoldInd: number;
  CurvInd: number;
}

class FreesurferDataTable extends React.Component<AllProps> {
  rows: IfsRow[];
  constructor(props: AllProps) {
    super(props);
    this.rows = this.mergeData();
  }
  // Description: build table rows from json/ts file
  // We need some validation for this merge ***** working
  mergeData = () => {
    const customizer = (objValue: any, srcValue: any) => {
      return [objValue, srcValue];
    };
    return _.mergeWith(lhData.slice(), rhData.slice(), customizer);
  };

  onSearch = (term: string) => {
    // Note: Stub search table data to be done
  };

  render() {
    return (
      !!this.rows && (
        <div className="freesurfer-data">
          <h1 className="pf-c-title pf-m-xl">FreeSurfer Parcellation Data</h1>
          <GridviewHeader />
          {this.rows.map((row: any, i) => {
            return <GridRow key={`row_${i}`} row={row} />;
          })}
        </div>
      )
    );
  }
}

const GridRow = (props: { row: IfsRow[]; key: string }) => {
  if (props.row.length > 0) {
    const lh = props.row[0],
      rh = props.row[1];
    return (
      <Grid className="fs-row">
        <GridItem className="name" sm={12} md={4}>
          {lh.StructName}
        </GridItem>
        <GridItem sm={12} md={1}>
          <b>left:</b> {lh.SurfArea}
        </GridItem>
        <GridItem className="highlight" sm={12} md={1}>
          <b>right:</b> {rh.SurfArea}
        </GridItem>
        <GridItem sm={12} md={1}>
          <b>left:</b> {lh.GrayVol}
        </GridItem>
        <GridItem className="highlight" sm={12} md={1}>
          <b>right:</b> {rh.GrayVol}
        </GridItem>
        <GridItem sm={12} md={1}>
          <b>left:</b> {lh.ThickAvg}
        </GridItem>
        <GridItem className="highlight" sm={12} md={1}>
          <b>right:</b> {rh.ThickAvg}
        </GridItem>
        <GridItem sm={12} md={1}>
          <b>left:</b> {lh.ThickStd}
        </GridItem>
        <GridItem className="highlight" sm={12} md={1}>
          <b>right:</b> {rh.ThickStd}
        </GridItem>
      </Grid>
    );
  } else {
    return (
      <Grid>
        <GridItem sm={12} md={4}>
          incomplete data for this row
        </GridItem>
      </Grid>
    );
  }
};

// Description: Build the Grid headers
const GridviewHeader = () => {
  return (
    <Grid className="fs-header hidden-md">
      <GridItem sm={12} md={4} rowSpan={2} className="spanRow">
        <b>Basic Structure</b>
      </GridItem>
      <GridItem sm={12} md={2}>
        <b>
          Surf Area (mm<sup>2</sup>)
        </b>
      </GridItem>
      <GridItem sm={12} md={2}>
        <b>
          Volume (mm<sup>3</sup>)
        </b>
      </GridItem>
      <GridItem sm={12} md={2}>
        <b>Thick Avg (mm)</b>
      </GridItem>
      <GridItem sm={12} md={2}>
        <b>Thick Std (mm)</b>
      </GridItem>
      {/* subheader */}
      <GridItem sm={12} md={1} offset={4}>
        Left
      </GridItem>
      <GridItem className="highlight" sm={12} md={1}>
        Right
      </GridItem>
      <GridItem sm={12} md={1}>
        Left
      </GridItem>
      <GridItem className="highlight" sm={12} md={1}>
        Right
      </GridItem>
      <GridItem sm={12} md={1}>
        Left
      </GridItem>
      <GridItem className="highlight" sm={12} md={1}>
        Right
      </GridItem>
      <GridItem sm={12} md={1}>
        Left
      </GridItem>
      <GridItem className="highlight" sm={12} md={1}>
        Right
      </GridItem>
    </Grid>
  );
};

export default React.memo(FreesurferDataTable);
