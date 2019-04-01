import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant
} from "@patternfly/react-table";
import { IFeedFile } from "../../api/models/feed-file.model";
import { csvData } from "../../assets/temp/segmentData";
import "./zScoreData.scss";
type AllProps = {
  files: IFeedFile[];
};

// interface IzScoreRow {
//   StructName: string;
//   zScoreLeft: number;
//   zScoreRight: number;
// }

const ZScoreDataTable: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const onSearch = (term: string) => {
    // Note: Stub search table data to be done
  };
  const headers = ["Basic Structure", "Left Hemisphere", "Right Hemisphere"];
  const formatData = (data: any[]) => {
    return data.map((arr: [string, number, number], index: number) => {
      const left = formatValue(arr[1]);
      const right = formatValue(arr[2]);
      return [
        arr[0],
        {
          title: (
            <span>
              <i className={`dot ${dotColor(left)}`} /> {left}
            </span>
          )
        },
        {
          title: (
            <span>
              <i className={`dot ${dotColor(right)}`} /> {right}
            </span>
          )
        }
      ];
    }
    );
  };
  const rows = formatData(csvData);
  return (
    <div className="zscore-table pf-u-px-lg">
      <h1 className="pf-c-title pf-m-xl">Deviation from Standard</h1>
      <Table
        aria-label="Data table"
        variant={TableVariant.compact}
        cells={headers}
        rows={rows} >
        <TableHeader />
        <TableBody />
      </Table>
    </div>
  );
};

// Description: determine the color for the dot, depending on value "significance"
// Change color as needed to red, orange, yellow || return "" if no sign
const dotColor = (value: number) => {
  let color = "";
  if (!isNaN(value)) {
    const absVal = Math.abs(value);
    color = (absVal >= 5) ? colorCode.red :
      (absVal >= 3 && absVal < 5) ? colorCode.orange :
        (absVal >= 2 && absVal < 3) ? colorCode.yellow : "";
  }
  return color; // orange, yellow
}
// This can be adjusted to change colors
enum colorCode {
  red = "red",
  orange = "orange",
  yellow= "yellow"
}

const formatValue = (value: number): number => {
  return !isNaN(value) ? Number(value.toFixed(2)) : value;
}

export default React.memo(ZScoreDataTable);
