import * as React from "react";
import { Alert, Button } from "@patternfly/react-core";
import { IUITreeNode, getFileExtension } from "../../api/models/file-explorer";
import FeedFileModel from "../../api/models/feed-file.model";
import { DownloadIcon } from "@patternfly/react-icons";
import { LoadingComponent } from "..";
import JSONPretty from "react-json-pretty";
import "./file-detail.scss";
type AllProps = {
  active: IUITreeNode;
  downloadFileNode: (node: IUITreeNode) => void;
};
interface IState {
  blob?: Blob;
  blobName: string;
  blobText: any;
  fileType: string;
}
class FileDetailView extends React.Component<AllProps, IState> {
  constructor(props: AllProps) {
    super(props);
    this.fetchData();
  }
  state = {
    blob: undefined,
    blobName: "",
    blobText: null,
    fileType: ""
  };

  render() {
    const { active } = this.props;
    const fileTypeViewer = () => {
      if (active.module !== this.state.blobName) {
        this.fetchData();
      } else {
        switch (this.state.fileType) {
          case "stats":
          case "json":
            return this.displayTextInIframe(this.state.blob);
          // dcm viewer to be done ***** working
          default:
            return this.noPreviewMessage();
        }
      }
    };
    return <div>{!!this.state.blob && fileTypeViewer()}</div>;
  }

  // Description: Fetch blob and read it into state to display preview
  fetchData() {
    const { active } = this.props;
    FeedFileModel.getFileBlob(active.file.file_resource).then((result: any) => {
      const _self = this;
      const fileType = getFileExtension(active);
      this.setState({ blob: result.data, blobName: active.module, fileType });
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          const blobText = e.target.result;
          _self.setState({ blobText });
        });
        reader.readAsText(result.data);
      }
    });
  }

  // Description: Return an iframe to display the content
  displayTextInIframe = (blob?: Blob) => {
    const { active } = this.props;
    if (!!blob) {
      const url = window.URL.createObjectURL(new Blob([blob]));
      return (
        <div>
          <div className={`header-panel ${this.state.fileType !== "json" && "sm"}`}>
            {this.renderDownloadButton()}
            <h1>
              File Preview: <b>{active.module}</b>
            </h1>
          </div>
          <div className="file-iframe">
            {this.state.fileType === "json" ? (
              <div className="json-display">
              <JSONPretty data={this.state.blobText} />
              </div>
            ) : (
              <div className="default-display">
                <iframe
                  key={this.state.blobName}
                  src={url}
                  height={window.innerHeight}
                  width="100%"
                />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return <LoadingComponent />;
    }
  };
  prettyPrintJson = {
    toHtml: (thing: any) => {
      const htmlEntities = (string: any) => {
        // Makes text displayable in browsers
        return string
          .replace(/&/g, "&amp;")
          .replace(/\\"/g, "&bsol;&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      };
      const replacer = (match: any, p1: any, p2: any, p3: any, p4: any) => {
        // Converts the four parenthesized capture groups into HTML
        const part = { indent: p1, key: p2, value: p3, end: p4 };
        const key = "<span class=json-key>";
        const val = "<span class=json-value>";
        const bool = "<span class=json-boolean>";
        const str = "<span class=json-string>";
        const isBool = ["true", "false"].includes(part.value);
        const valSpan = /^"/.test(part.value) ? str : isBool ? bool : val;
        const findName = /"([\w]+)": |(.*): /;
        const indentHtml = part.indent || "";
        const keyHtml = part.key
          ? key + part.key.replace(findName, "$1$2") + "</span>: "
          : "";
        const valueHtml = part.value ? valSpan + part.value + "</span>" : "";
        const endHtml = part.end || "";
        return indentHtml + keyHtml + valueHtml + endHtml;
      };
      const jsonLine = /^( *)("[^"]+": )?("[^"]*"|[\w.+-]*)?([{}[\],]*)?$/gm;
      return htmlEntities(JSON.stringify(thing, null, 3)).replace(
        jsonLine,
        replacer
      );
    }
  };

  // Description: No preview message available for this file type
  noPreviewMessage = () => {
    const { active } = this.props;
    const ext = getFileExtension(active);
    const alertText = (
      <React.Fragment>
        <label>
          <b>File Name:</b> {active.module}
        </label>
        <label>
          <b>File Type:</b> {ext}
        </label>
        {this.renderDownloadButton()}
      </React.Fragment>
    );
    return (
      <div className="file-detail">
        <Alert
          variant="info"
          title="No preview available for file:"
          children={alertText}
        />
      </div>
    );
  };

  renderDownloadButton = () => {
    const { active, downloadFileNode } = this.props;
    return (
      <Button
        variant="primary"
        className="float-right"
        onClick={() => {
          downloadFileNode(active);
        }}
      >
        <DownloadIcon /> Download
      </Button>
    );
  };

  // _prettifyJson(jsonString: string) {
  //   // const json = JSON.parse(jsonString);
  //   // console.log(json);
  //   return jsonString;

  // }
  // _prettifyJson(json: string) {
  //   if (typeof json !== "string") {
  //     json = JSON.stringify(json, undefined, 2);
  //   }
  //   json = json
  //     .replace(/&/g, "&amp;")
  //     .replace(/</g, "&lt;")
  //     .replace(/>/g, "&gt;");
  //   return json.replace(
  //     /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
  //     (match: any) => {
  //       let cls = "number";
  //       if (/^"/.test(match)) {
  //         if (/:$/.test(match)) {
  //           cls = "key";
  //         } else {
  //           cls = "string";
  //         }
  //       } else if (/true|false/.test(match)) {
  //         cls = "boolean";
  //       } else if (/null/.test(match)) {
  //         cls = "null";
  //       }
  //       return '<span class="' + cls + '">' + match + "</span>";
  //     }
  //   );
  // }
}

export default FileDetailView;
