import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
<<<<<<< HEAD
<<<<<<< HEAD
=======
import { HomeIcon } from "../Icons";
>>>>>>> 8412135d (feat: A mvp for the library page)
=======
>>>>>>> 3c50fa9a (refactor: fix merge conflicts)

const BreadcrumbContainer = ({
  path,
  handleFolderClick,
}: {
  path: string;
  handleFolderClick: (path: string) => void;
}) => {
<<<<<<< HEAD
  const initialPathSplit = path !== "/" ? path.split("/") : [];

  return (
    <Breadcrumb style={{ marginTop: "1rem" }}>
      <BreadcrumbItem
        onClick={() => {
          handleFolderClick(" ");
        }}
        to="#"
      >
        /
      </BreadcrumbItem>
=======
  const initialPathSplit = path.split("/");

  return (
    <Breadcrumb>
>>>>>>> 8412135d (feat: A mvp for the library page)
      {initialPathSplit.map((path: string, index) => {
        return (
          <BreadcrumbItem
            onClick={() => {
<<<<<<< HEAD
              const newPath = initialPathSplit.slice(0, index + 1).join("/");
              handleFolderClick(`/${newPath}`);
=======
              if (index === 0) {
                handleFolderClick("");
              } else {
                const newPath = initialPathSplit.slice(0, index + 1).join("/");
                handleFolderClick(`/${newPath}`);
              }
>>>>>>> 8412135d (feat: A mvp for the library page)
            }}
            key={`breadcrumb_${index}`}
            to="#"
          >
<<<<<<< HEAD
            {path}
=======
            {index === 0 ? <HomeIcon /> : path}
>>>>>>> 8412135d (feat: A mvp for the library page)
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbContainer;
