import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";

const BreadcrumbContainer = ({
  path,
  handleFolderClick,
}: {
  path: string;
  handleFolderClick: (path: string) => void;
}) => {
  const initialPathSplit = path !== "/" ? path.split("/") : [];

  return (
    <Breadcrumb style={{ marginTop: "1rem" }}>
      <BreadcrumbItem
        onClick={() => {
          handleFolderClick(" ");
        }}
        to="#"
      >
        root
      </BreadcrumbItem>
      {initialPathSplit.map((path: string, index) => {
        return (
          <BreadcrumbItem
            onClick={() => {
              const newPath = initialPathSplit.slice(0, index + 1).join("/");
              handleFolderClick(`/${newPath}`);
            }}
            key={`breadcrumb_${index}`}
            to="#"
          >
            {path}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbContainer;