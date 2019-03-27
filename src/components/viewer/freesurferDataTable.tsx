import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant
} from "@patternfly/react-table";
import { DataTableToolbar } from "../index";
import { IFeedFile } from "../../api/models/feed-file.model";
import { lhData } from "../../assets/temp/lh.aparc.a2009s";
import { rhData } from "../../assets/temp/rh.aparc.a2009s";

type AllProps = {
  files: IFeedFile[];
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
  rows: any[];
  constructor(props: AllProps) {
    super(props);
    this.rows = this.buildTableData(lhData);
  }

  onSearch = (term: string) => {
    // console.log("search", term);
  };
  headers = [
    "Basic Structure",
    "Surf Area (mm^2)",
    "Volume (mm^3)",
    "Thick Avg(mm)",
    "Thick Std(mm)"
  ];

  // Description: build table rows from json/ts file
  buildTableData = (outdata: IfsRow[]) => {
    const rowArr = new Array();
    outdata.forEach((obj: IfsRow) => {
      rowArr.push([
        obj.StructName,
        obj.SurfArea,
        obj.GrayVol,
        obj.ThickAvg,
        obj.ThickStd
      ]);
    });

    return rowArr;
  };
  render() {
    return (
      !!this.rows && <div className="dataTable-viewer pf-u-px-lg">
        <DataTableToolbar onSearch={this.onSearch} label="brain structure" />
        <Table
          aria-label="Data table"
          variant={TableVariant.compact}
          cells={this.headers}
          rows={this.rows}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </div>
    );
  }
}

export default React.memo(FreesurferDataTable);
