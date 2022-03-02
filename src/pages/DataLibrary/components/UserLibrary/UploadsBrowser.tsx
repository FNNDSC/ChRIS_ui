import React from "react";
import {
  Grid,
  GridItem,
  Card,
  CardHeader,
  Split,
  SplitItem,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbHeading,
} from "@patternfly/react-core";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { useTypedSelector } from "../../../../store/hooks";

const UploadsBrowser = () => {
  const username = useTypedSelector((state) => state.user.username);
  const [folders, setSubFolders] = React.useState<string[]>([]);
  const [initialPath, setInitialPath] = React.useState("/");

  React.useEffect(() => {
    async function fetchUploads() {
      if (username) {
        const client = ChrisAPIClient.getClient();
        const uploads = await client.getFileBrowserPath(``);

        if (uploads.data.subfolders) {
          const folders = uploads.data.subfolders.split(",");
          setSubFolders(folders);
          setInitialPath(`/`);
        }
      }
    }

    fetchUploads();
  }, []);

  const handleFolderClick = async (path: string) => {
    const client = ChrisAPIClient.getClient();
    const uploads = await client.getFileBrowserPath(path);
    if (uploads.data.subfolders && uploads.data.subfolders.length > 0) {
      const folders = uploads.data.subfolders.split(",");
      setSubFolders(folders);
      setInitialPath(path);
    } else {
      const params = {
        limit: 100,
        offset: 0,
        fname_icontains: `${path}/`,
        fname: `${path}/`,
      };
      const files = await client.getFiles(params);
      console.log("Files", files);
    }
  };

  return (
    <>
      <Breadcrumb>
        {initialPath.length > 0 &&
          initialPath.split("/").map((path, index) => {
            return (
              <BreadcrumbItem
                onClick={() => {
                  const index = initialPath
                    .split("/")
                    .findIndex((pathFind) => pathFind === path);
                  const newPath = initialPath.split("/").slice(0, index);
                  setInitialPath(newPath.join("/"));
                  handleFolderClick(newPath.join("/"));
                }}
                showDivider={true}
                key={index}
                to="#"
              >
                {path}
              </BreadcrumbItem>
            );
          })}
      </Breadcrumb>
      <Browser
        initialPath={initialPath}
        handleFolderClick={handleFolderClick}
        folders={folders}
      />
    </>
  );
};

export default UploadsBrowser;

function Browser({
  initialPath,
  folders,
  handleFolderClick,
}: {
  initialPath: string;
  folders: string[];
  handleFolderClick: (path: string) => void;
}) {
  return (
    <Grid hasGutter>
      <GridItem sm={12} lg={4}>
        {folders.map((folder, index) => {
          return (
            <FolderCard
              initialPath={initialPath}
              handleFolderClick={handleFolderClick}
              key={index}
              folder={folder}
            />
          );
        })}
      </GridItem>
    </Grid>
  );
}

function FolderCard({
  initialPath,
  folder,
  handleFolderClick,
}: {
  initialPath: string;
  folder: string;
  handleFolderClick: (path: string) => void;
}) {
  return (
    <Card isHoverable isSelectable isRounded>
      <CardHeader>
        <Split style={{ overflow: "hidden" }}>
          <SplitItem isFilled style={{ marginRight: "1em" }}>
            <Button
              variant="link"
              onClick={() => {
                handleFolderClick(`${initialPath}/${folder}`);
              }}
            >
              <b>{elipses(folder, 36)}</b>
            </Button>
          </SplitItem>
        </Split>
      </CardHeader>
    </Card>
  );
}

function elipses(str: string, len: number) {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + "...";
}