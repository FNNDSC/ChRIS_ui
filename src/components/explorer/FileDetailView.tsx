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
import { IUITreeNode } from "../../api/models/file-explorer";

type AllProps = {
  active: IUITreeNode;
};

const FileDetailView: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const data = parseTableData(props.active);
  return (
    !!data && (
      <div className="pf-u-p-sm">
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
    )
  );
};
// Build data table for
const parseTableData = (node: IUITreeNode) => {
  return {
    columns: ["Name", "Date", "Type", "Size", ""],
    rows: buildRow(node),
    actions: [
      {
        title: "Download",
        onClick: (event: any, rowId: any) =>
          console.log("clicked on Some action, on row: ", rowId)
      }
    ]
  };
};

const buildRow = (node: IUITreeNode) => {
  const arr = new Array();
  if (!!node.children && node.children.length) {
    node.children.forEach((child: IUITreeNode) => {
      const isfile = !!child.leaf && child.leaf;
      const newRow = [
        {
          title: (
            <React.Fragment>
              {isfile ? (
                <OutlinedFileImageIcon />
              ) : (
                <FolderIcon color="#ffee99" />
              )}{" "}
              {child.module}
            </React.Fragment>
          )
        },
        "TBD",
        getItemType(child),
        "7.5 MB - TBD",
        {
          title: (
            <React.Fragment>
              {isfile ? (
                <a
                  onClick={() => {
                    console.log("Download");
                  }}
                >
                  <DownloadIcon /> Download
                </a>
              ) : (
                ""
              )}
            </React.Fragment>
          )
        }
      ];
      arr.push(newRow);
    });
  }

  return arr;
};

// Description: get file type by file extention
const getItemType = (item: IUITreeNode) => {
  const isfile = !!item.leaf && item.leaf;
  const ext = item.module.substring(item.module.lastIndexOf(".") + 1);
  return isfile ? `${ext} File` : "File folder";
};

// const data = {
//   columns: ["Name", "Date", "Type", "Size", ""],
//   rows: [
//     [
//       {
//         title: (
//           <React.Fragment>
//             <FolderIcon color="#ffee99" /> Folder X
//           </React.Fragment>
//         )
//       },
//       "2 Jan 2019 @10:12",
//       "File folder",
//       "7.5 MB",
//       {
//         title: (
// <a
//   onClick={() => {
//     console.log("Download");
//   }}
// >
//   <DownloadIcon /> Download
// </a>
//         )
//       }
//     ],
//     [
//       {
//         title: (
//           <React.Fragment>
//             <OutlinedFileImageIcon /> jobStatusSummary
//           </React.Fragment>
//         )
//       },
//       "2 Jan 2019 @10:12",
//       ".json",
//       "36.2 MB",
//       {
//         title: (
//           <a
//             onClick={() => {
//               console.log("Download");
//             }}
//           >
//             <DownloadIcon /> Download
//           </a>
//         )
//       }
//     ],
//     [
//       {
//         title: (
//           <React.Fragment>
//             <OutlinedFileCodeIcon /> jobStatus
//           </React.Fragment>
//         )
//       },
//       "2 Jan 2019 @10:12",
//       ".dcm",
//       "36 MB",
//       {
//         title: (
//           <a
//             onClick={() => {
//               console.log("Download");
//             }}
//           >
//             <DownloadIcon /> Download
//           </a>
//         )
//       }
//     ],
//     [
//       {
//         title: (
//           <React.Fragment>
//             <OutlinedFileCodeIcon /> output.meta
//           </React.Fragment>
//         )
//       },
//       "2 Jan 2019 @10:12",
//       ".json",
//       "35 MB",
//       {
//         title: (
//           <a
//             onClick={() => {
//               console.log("Download");
//             }}
//           >
//             <DownloadIcon /> Download
//           </a>
//         )
//       }
//     ],
//     [
//       {
//         title: (
//           <React.Fragment>
//             <OutlinedFileAltIcon /> squashHereDir
//           </React.Fragment>
//         )
//       },
//       "2 Jan 2019 @10:12",
//       ".txt",
//       "35.8 KB",
//       {
//         title: (
//           <a
//             onClick={() => {
//               console.log("Download");
//             }}
//           >
//             <DownloadIcon /> Download
//           </a>
//         )
//       }
//     ]
//   ],
//   actions: [
//     {
//       title: "Download",
//       onClick: (event: any, rowId: any) =>
//         console.log("clicked on Some action, on row: ", rowId)
//     }
//   ]
// };
export default React.memo(FileDetailView);
