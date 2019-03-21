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
import FeedFileModel from "../../api/models/feed-file.model";
import { IUITreeNode } from "../../api/models/file-explorer";
import FileDetailView from "../explorer/FileDetailView";
import { IAuth, FeedFile } from "@fnndsc/chrisapi";
type AllProps = {
  active: IUITreeNode;
  onClickNode: (node: IUITreeNode) => void;
};

class FileTableView extends React.Component<AllProps> {
  // Description: handle file download ***** working - to be done

  handleFileDownload(node: IUITreeNode) {
    const auth: IAuth = {
      token: `${window.sessionStorage.getItem("AUTH_TOKEN")}`
    };
    const downloadUrl = node.file.file_resource;
    if (!!node.file) {
      const test = FeedFileModel.getFileBlob(downloadUrl)
        .then((result: any) => {
          downloadFile(result.data, node.module);
        })
        .catch((error: any) => console.error("(1) Inside error:", error));
    } else {
      console.error("ERROR DOWNLOADING: download url is not defined");
    }
  }

  render() {
    const { active } = this.props;
    const data = this.parseTableData(active);
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
    return !!active.leaf && active.leaf ? (
      <FileDetailView
        active={active}
        downloadFileNode={this.handleFileDownload}
      />
    ) : (
      tableView
    );
  }

  // Build data table for
  parseTableData = (node: IUITreeNode) => {
    return {
      columns: ["Name", "Date", "Type", "Size", ""],
      rows: this.buildRow(node)
    };
  };
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
  };

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
  };

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
  };

  // Description: get file type by file extention
  getItemType = (item: IUITreeNode) => {
    const isfile = !!item.leaf && item.leaf;
    const ext = item.module.substring(item.module.lastIndexOf(".") + 1);
    return isfile ? `${ext} File` : "File folder";
  }
}


// Description: Download file
function downloadFile(Fileblob: any, fileName: string) {
  const url = window.URL.createObjectURL(new Blob([Fileblob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default React.memo(FileTableView);
