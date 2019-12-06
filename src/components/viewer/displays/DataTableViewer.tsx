import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant
} from "@patternfly/react-table";
import { DataTableToolbar } from "../../index";
import { FeedFile } from "@fnndsc/chrisapi";
type AllProps = {
  files: FeedFile[];
};

const DataTableViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const onSearch = (term: string) => {
    // Note: Stub search table data to be done
  };

  return (
    <div className="dataTable-viewer pf-u-px-lg">
      <DataTableToolbar onSearch={onSearch} label="brain structure" />
      <Table
        aria-label="Data table"
        variant={TableVariant.compact}
        cells={data.columns}
        rows={data.rows}
      >
        <TableHeader />
        <TableBody />
      </Table>
    </div>
  );
};

const data = {
  columns: ["Basic Structure", "Side", "Volume", "Avg Vol", "Deviation"],
  rows: [
    [
      "Corpus Callosum ",
      "---",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot red" /> 5.43
          </span>
        )
      }
    ],
    [
      "Superior Frontal Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.12
          </span>
        )
      }
    ],
    [
      "Superior Frontal Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.321
          </span>
        )
      }
    ],
    [
      "Middle Frontal Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.45
          </span>
        )
      }
    ],
    [
      "Middle Frontal Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.115
          </span>
        )
      }
    ],
    [
      "Inferior Frontal Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.167
          </span>
        )
      }
    ],
    [
      "Inferior Frontal Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.329
          </span>
        )
      }
    ],
    [
      "Precentral Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.228
          </span>
        )
      }
    ],
    [
      "Precentral Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.187
          </span>
        )
      }
    ],
    [
      "Middle Orbitofrontal Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.136
          </span>
        )
      }
    ],
    [
      "Middle Orbitofrontal Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.481
          </span>
        )
      }
    ],
    [
      "Lateral Orbitofrontal Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.124
          </span>
        )
      }
    ],
    [
      "Lateral Orbitofrontal Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.763
          </span>
        )
      }
    ],
    [
      "Gyrus Rectus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot orange" /> 4.32
          </span>
        )
      }
    ],
    [
      "Gyrus Rectus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot orange" /> 4.21
          </span>
        )
      }
    ],
    [
      "Postcentral Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.328
          </span>
        )
      }
    ],
    [
      "Postcentral Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.211
          </span>
        )
      }
    ],
    [
      "Superior Parietal Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.365
          </span>
        )
      }
    ],
    [
      "Superior Parietal Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.014
          </span>
        )
      }
    ],
    [
      "Supramarginal Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.118
          </span>
        )
      }
    ],
    [
      "Supramarginal Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.241
          </span>
        )
      }
    ],
    [
      "Angular Gyrus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot yellow" /> 2.56
          </span>
        )
      }
    ],
    [
      "Angular Gyrus ",
      "Right",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot yellow" /> 2.73
          </span>
        )
      }
    ],
    [
      "Precuneus ",
      "Left",
      "123.345",
      "123.345",
      {
        title: (
          <span>
            <i className="dot" /> 0.123
          </span>
        )
      }
    ]
  ]
};

export default React.memo(DataTableViewer);
