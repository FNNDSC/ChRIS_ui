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
// Description: Build each table data row
const buildRow = (node: IUITreeNode) => {
  const arr = new Array();
  if (!!node.children && node.children.length) {
    node.children.forEach((child: IUITreeNode) => {
      const isfile = !!child.leaf && child.leaf;
      const newRow = [
        {
          title: (
            buildNameCellLink(child, isfile)
          )
        },
        "TBD",
        getItemType(child),
        "7.5 MB - TBD",
        {
          title: (
            buildActionCell(child, isfile)
          )
        }
      ];
      arr.push(newRow);
    });
  }

  return arr;
};

// Description: Build the file or folder name link
const buildNameCellLink = (child: IUITreeNode, isfile: boolean) => {
  return <React.Fragment>
  <a
    className="black-900"
    onClick={() => {
      console.log("Click");
    }}
  >
    {isfile ? (
      <OutlinedFileImageIcon />
    ) : (
      <FolderIcon color="#ffee99" />
    )}
    {child.module}
  </a>
</React.Fragment>;
};


// Description: Build the Download and other actions cell
const buildActionCell = (child: IUITreeNode, isfile: boolean) => {
  return <React.Fragment>
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
</React.Fragment>;
};

// Description: get file type by file extention
const getItemType = (item: IUITreeNode) => {
  const isfile = !!item.leaf && item.leaf;
  const ext = item.module.substring(item.module.lastIndexOf(".") + 1);
  return isfile ? `${ext} File` : "File folder";
};

export default React.memo(FileDetailView);
