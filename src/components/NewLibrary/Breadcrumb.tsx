import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import { HomeIcon } from "../Icons";

const BreadcrumbContainer = ({
  path,
  handleFolderClick,
}: {
  path: string;
  handleFolderClick: (path: string) => void;
}) => {
  const initialPathSplit = path.split("/");

  return (
    <Breadcrumb style={{ marginTop: "1rem" }}>
      {initialPathSplit.map((path: string, index) => {
        return (
          <BreadcrumbItem
            onClick={() => {
              if (index === 0) {
                handleFolderClick("");
              } else {
                const newPath = initialPathSplit.slice(0, index + 1).join("/");
                handleFolderClick(`/${newPath}`);
              }
            }}
            key={`breadcrumb_${index}`}
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
