import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant
} from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
type AllProps = {
  data: any[];
};

const FileDetailView: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const data = {
    columns: ["Name", "Date", "Type", "Size", ""],
    rows: [
        [
            {
                title: <a>File Name</a>
            }, "Date", "Type", "Size",
            {
                title:  <Button
                variant="secondary"
                >Download</Button>
            }
        ],
        [
            {
                title: <a>File Name</a>
            }, "Date", "Type", "Size",
            {
                title:  <Button
                variant="secondary"
                >Download</Button>
            }
        ],
        [
            {
                title: <a>File Name</a>
            }, "Date", "Type", "Size",
            {
                title:  <Button
                variant="secondary"
                >Download</Button>
            }
        ],
        [
            {
                title: <a>File Name</a>
            }, "Date", "Type", "Size",
            {
                title:  <Button
                variant="secondary"
                >Download</Button>
            }
        ],
        [
            {
                title: <a>File Name</a>
            }, "Date", "Type", "Size",
            {
                title:  <Button
                variant="secondary"
                >Download</Button>
            }
        ]
    ],
    actions: [
      {
        title: "Download",
        onClick: (event: any, rowId: any) =>
          console.log("clicked on Some action, on row: ", rowId)
      }
    ]
  };
    const onSearch = (term: string) => {
    console.log("search", term);
  };
    return (
    <div className="pf-u-p-sm">
      {/* <DataTableToolbar onSearch={onSearch} /> */}
      <Table
        aria-label="Data table"
        variant={TableVariant.compact}
        cells={data.columns}
        rows={data.rows} >
        <TableHeader />
        <TableBody />
      </Table>
    </div>
  );
};

export default React.memo(FileDetailView);
