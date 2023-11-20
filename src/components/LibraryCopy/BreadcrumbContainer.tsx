import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import HomeIcon from "@patternfly/react-icons/dist/esm/icons/home-icon";

const BreadcrumbContainer = ({
  path,
  handleFolderClick,
}: {
  path: string;
  handleFolderClick: (path: string) => void;
}) => {
  const initialPathSplit = path.split("/");

  return (
    <Breadcrumb style={{ margin: "1em 1em 1em 1em" }}>
      {initialPathSplit.map((path: string, index) => {
        return (
          <BreadcrumbItem
            onClick={() => {
              const newPath =
                index === 0
                  ? ""
                  : initialPathSplit.slice(0, index + 1).join("/");

              handleFolderClick(newPath);
            }}
            key={index}
            to="#"
          >
            {index === 0 ? <HomeIcon /> : path}
          </BreadcrumbItem>
        
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbContainer;
