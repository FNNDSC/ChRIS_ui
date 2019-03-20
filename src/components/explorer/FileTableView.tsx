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
  OutlinedFileImageIcon
} from "@patternfly/react-icons";
import { IUITreeNode } from "../../api/models/file-explorer";
import FileDetailView from "../explorer/FileDetailView";

type AllProps = {
  active: IUITreeNode;
  onClickNode: (node: IUITreeNode) => void;
};

class FileTableView extends React.Component<AllProps> {

  // Description: handle file download ***** working - to be done
  handleFileDownload(node: IUITreeNode){
    // console.log("handleFileDownload:", node);
  }

  render() {
    const { active } = this.props;
    const data = this.parseTableData(active);
    console.log(active);
    const tableView = (
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
    );
    return !!active.leaf && active.leaf ? <FileDetailView active={active} downloadFileNode={this.handleFileDownload} /> : tableView;
  }

  // Build data table for
  parseTableData = (node: IUITreeNode) => {
    return {
      columns: ["Name", "Date", "Type", "Size", ""],
      rows: this.buildRow(node)
    };
  }
  // Description: Build each table data row
  buildRow = (node: IUITreeNode) => {
    const arr = new Array();
    if (!!node.children && node.children.length) {
      node.children.forEach((child: IUITreeNode) => {
        const isfile = !!child.leaf && child.leaf;
        const newRow = [
          {
            title: this.buildNameCellLink(child, isfile)
          },
          "TBD",
          this.getItemType(child),
          "7.5 MB - TBD",
          {
            title: this.buildActionCell(child, isfile)
          }
        ];
        arr.push(newRow);
      });
    }

    return arr;
  }

  // Description: Build the file or folder name link
  buildNameCellLink = (child: IUITreeNode, isfile: boolean) => {
    const { onClickNode } = this.props;
    return (
      <React.Fragment>
        <a
          className="black-900"
          onClick={() => {
            onClickNode(child);
          }}
        >
          {isfile ? <OutlinedFileImageIcon /> : <FolderIcon color="#ffee99" />}
          {child.module}
        </a>
      </React.Fragment>
    );
  }

  // Description: Build the Download and other actions cell
  buildActionCell = (child: IUITreeNode, isfile: boolean) => {
    return (
      <React.Fragment>
        {isfile ? (
          <a
            onClick={() => {
              this.handleFileDownload(child);
            }}
          >
            <DownloadIcon /> Download
          </a>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }

  // Description: get file type by file extention
  getItemType = (item: IUITreeNode) => {
    const isfile = !!item.leaf && item.leaf;
    const ext = item.module.substring(item.module.lastIndexOf(".") + 1);
    return isfile ? `${ext} File` : "File folder";
  }
}

export default React.memo(FileTableView);
