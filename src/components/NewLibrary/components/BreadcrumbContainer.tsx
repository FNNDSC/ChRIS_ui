import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import { useNavigate } from "react-router";
import { HomeIcon } from "../../Icons";

const BreadcrumbContainer = ({
  path,
  handleFolderClick,
  username,
}: {
  path: string;
  handleFolderClick: (path: string) => void;
  username: string;
}) => {
  const navigate = useNavigate();
  // Removing leading and trailing slashes and splitting the path
  const initialPathSplit =
    path !== "/" ? path.replace(/^\/|\/$/g, "").split("/") : [];

  const style = {
    fontSize: "1rem",
    cursor: "pointer",
    color: "#1fa7f8",
  };

  const showHomeButton = path !== `home/${username}`;

  return (
    <>
      <Toolbar
        style={{ paddingTop: "0", paddingLeft: "0", paddingBottom: "0" }}
      >
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
                    key={`breadcrumb-${segment}`}
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

      {showHomeButton && (
        <Tooltip content="Go to your home directory">
          <Button
            onClick={() => {
              navigate(`home/${username}`);
            }}
            icon={<HomeIcon />}
            variant="link"
          />
        </Tooltip>
      )}
    </>
  );
};

export default BreadcrumbContainer;
