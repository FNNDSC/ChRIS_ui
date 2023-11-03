import {
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Button,
} from "@patternfly/react-core";
import FaFolder from "@patternfly/react-icons/dist/esm/icons/folder-icon";
import FaFolderOpen from "@patternfly/react-icons/dist/esm/icons/folder-open-alt-icon";
import FaUser from "@patternfly/react-icons/dist/esm/icons/user-icon";
import FaHome from "@patternfly/react-icons/dist/esm/icons/home-icon";
import FcServices from "@patternfly/react-icons/dist/esm/icons/services-icon";
import { ClipboardCopyContainer } from "../Common";

export interface Breadcrumb {
  browserType: string;
  handleFolderClick: (path: string) => void;
  path: string;
  files: any[];
  folderDetails: { currentFolder: string; totalCount: number };
  togglePreview: () => void;
  previewAll: boolean;
}

const BreadcrumbContainer = ({
  handleFolderClick,
  path,
  browserType,
  files,
  folderDetails,
  togglePreview,
  previewAll,
}: Breadcrumb) => {
  const initialPathSplit =
    browserType === "feed" && path === "/"
      ? [path]
      : browserType === "feed" && path !== "/"
      ? path.split("/").filter((path) => path !== "")
      : path.split("/");
  const style = { width: "2em", height: "0.85em" };

  return (
    <>
      {browserType === "feed" && path !== "/" && (
        <BreadcrumbItem
          to="#"
          onClick={() => {
            handleFolderClick("/");
          }}
        >
          <FaHome style={style} />
          root
        </BreadcrumbItem>
      )}
      <ClipboardCopyContainer path={path} />

      <Breadcrumb style={{ margin: "1em 0 1em 0" }}>
        {initialPathSplit.map((path: string, index) => {
          let icon;

          if (
            (browserType === "feed" || browserType === "uploads") &&
            index === 0 &&
            path !== "/"
          ) {
            icon = <FaUser style={style} />;
          } else if (index === 0 && browserType === "services") {
            icon = <FcServices style={style} />;
          } else if (
            index === initialPathSplit.length - 1 &&
            initialPathSplit.length > 1
          ) {
            icon = <FaFolderOpen style={style} />;
          } else if (browserType !== "feed") {
            icon = <FaFolder style={style} />;
          }

          return (
            <BreadcrumbItem
              to={index !== 0 || browserType !== "uploads" ? "#" : undefined}
              onClick={() => {
                if (index === 0 && browserType === "uploads") {
                  return;
                }

                const newPath = initialPathSplit.slice(0, index + 1).join("/");
                handleFolderClick(newPath);
              }}
              key={index}
            >
              {icon}
              {path}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
      {files && files.length > 0 && (
        <Split
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <SplitItem>
            <h3>
              <FaFolderOpen style={{ marginRight: "0.5rem" }} />
              {folderDetails.currentFolder}
            </h3>
            <h3 style={{ marginTop: "1rem" }}>
              {folderDetails.totalCount} items
            </h3>
          </SplitItem>

          <SplitItem>
            <Button
              onClick={() => {
                togglePreview();
              }}
            >
              {previewAll ? "Hide All Previews" : "Preview All"}
            </Button>
          </SplitItem>
        </Split>
      )}
    </>
  );
};

export default BreadcrumbContainer;
