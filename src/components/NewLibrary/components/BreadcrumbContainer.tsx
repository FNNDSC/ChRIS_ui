import {
  Breadcrumb,
  BreadcrumbItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";

const BreadcrumbContainer = ({
  path,
  handleFolderClick,
}: {
  path: string;
  handleFolderClick: (path: string) => void;
}) => {
  // Removing leading and trailing slashes and splitting the path
  const initialPathSplit =
    path !== "/" ? path.replace(/^\/|\/$/g, "").split("/") : [];

  const style = {
    fontSize: "1rem",
    cursor: "pointer",
    color: "#1fa7f8",
  };

  return (
    <Toolbar style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0" }}>
      <ToolbarContent>
        <ToolbarItem>
          <Breadcrumb>
            <BreadcrumbItem
              style={style}
              onClick={() => handleFolderClick("/library")}
            >
              /
            </BreadcrumbItem>

            {initialPathSplit.map((segment: string, index: number) => {
              const newPath = `${initialPathSplit.slice(0, index + 1).join("/")}`;
              return (
                <BreadcrumbItem
                  style={style}
                  key={`breadcrumb-${segment}-${index}`}
                  onClick={() => handleFolderClick(newPath)}
                >
                  {segment}
                </BreadcrumbItem>
              );
            })}
          </Breadcrumb>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default BreadcrumbContainer;
