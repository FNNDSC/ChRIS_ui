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
import { IUITreeNode, getFileExtension } from "../../api/models/file-explorer.model";


type AllProps = {
  selectedFolder: IUITreeNode;
  downloadFileNode: (node: IUITreeNode) => void;
  onClickNode: (node: IUITreeNode) => void;
};

class FileTableView extends React.Component<AllProps> {
  render() {
    const { selectedFolder } = this.props;
    const data = this.parseTableData(selectedFolder);
    const tableView = (
      <div className="pf-u-p-sm">
        <Table
          aria-label="Data table"
          variant={TableVariant.compact}
          cells={data.columns}
          rows={data.rows}>
          <TableHeader />
          <TableBody />
        </Table>
      </div>
    );
    return tableView;
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
    // eslint-disable-next-line
    const arr = new Array();
    if (!!node.children && node.children.length) {
      node.children.forEach((child: IUITreeNode) => {
        const isfile = !!child.leaf && child.leaf;
        const newRow = [
          {
            title: this.buildNameCellLink(child, isfile)
          },
          "TBD",
          <span className="capitalize">{this.getItemType(child)}</span>,
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
        { /* eslint-disable-next-line */ }
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
    const { downloadFileNode } = this.props
    return (
      <React.Fragment>
        {isfile ? (
            //eslint-disable-next-line
          <a
            onClick={() => {
              downloadFileNode(child);
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
    return isfile ? `${getFileExtension(item.module)} File` : "File folder";
  }
}



export default React.memo(FileTableView);
