import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant
} from "@patternfly/react-table";
import {
  DownloadIcon,
  FolderIcon,
  OutlinedFileImageIcon,
  OutlinedFileCodeIcon,
  OutlinedFileAltIcon
} from "@patternfly/react-icons";

type AllProps = {
  data: any[];

};

const FileDetailView: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const data = {
    columns: ["Name", "Date", "Type", "Size", ""],
    rows: [
        [
            {
                title: <React.Fragment><FolderIcon color="#ffee99" /> Folder X</React.Fragment>
            }, "2 Jan 2019 @10:12", "File folder", "7.5 MB",
            {
                title:  <a onClick={() => {console.log("Download"); }}><DownloadIcon /> Download</a>
            }
        ],
        [
            {
                title: <React.Fragment><OutlinedFileImageIcon /> jobStatusSummary</React.Fragment>
            }, "2 Jan 2019 @10:12", ".json", "36.2 MB",
            {
              title:  <a onClick={() => {console.log("Download"); }}><DownloadIcon /> Download</a>
            }
        ],
        [
            {
              title: <React.Fragment><OutlinedFileCodeIcon /> jobStatus</React.Fragment>
            }, "2 Jan 2019 @10:12", ".dcm", "36 MB",
            {
              title:  <a onClick={() => {console.log("Download"); }}><DownloadIcon /> Download</a>
            }
        ],
        [
            {
              title: <React.Fragment><OutlinedFileCodeIcon /> output.meta</React.Fragment>
            }, "2 Jan 2019 @10:12", ".json", "35 MB",
            {
              title:  <a onClick={() => {console.log("Download"); }}><DownloadIcon /> Download</a>
            }
        ],
        [
            {
              title: <React.Fragment><OutlinedFileAltIcon /> squashHereDir</React.Fragment>
            }, "2 Jan 2019 @10:12", ".txt", "35.8 KB",
            {
              title:  <a onClick={() => {console.log("Download"); }}><DownloadIcon /> Download</a>
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
