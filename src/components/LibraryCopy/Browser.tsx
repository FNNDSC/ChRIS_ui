import { Grid, GridItem } from "@patternfly/react-core";
import FileCard from "./FileCard";
import FolderCard from "./FolderCard";

interface BrowserProps {
  files?: any[];
  folders?: string[];
  handleFolderClick: (path: string) => void;
  path: string;
}

const Browser = ({ handleFolderClick, folders, files, path }: BrowserProps) => {
  return (
    <Grid
      style={{
        margin: "1rem",
      }}
      hasGutter
    >
      {files &&
        files.length > 0 &&
        files.map((file) => {
          return (
            <GridItem sm={1} lg={4} md={4} xl={4} xl2={4} key={file.data.fname}>
              <FileCard file={file} />
            </GridItem>
          );
        })}
      {folders &&
        folders.length > 0 &&
        folders.map((folder, index) => {
          return (
            <GridItem
              sm={1}
              lg={4}
              md={4}
              xl={4}
              xl2={4}
              key={`${folder}_${index}`}
            >
              <FolderCard
                path={path}
                folder={folder}
                handleFolderClick={handleFolderClick}
              />
            </GridItem>
          );
        })}
    </Grid>
  );
};

export default Browser;
