import type { ThunkModuleToFunc, UseThunk } from "@chhsiao1981/use-thunk";
import type { FileBrowserFolderFile, PACSFile } from "@fnndsc/chrisapi";
import { Label, Text } from "@patternfly/react-core";
import { fileViewerMap, getFileExtension } from "../../api/model";
import type * as DoUser from "../../reducers/user";
import ViewerDisplay from "./displays/ViewerDisplay";

type TDoUser = ThunkModuleToFunc<typeof DoUser>;

type Props = {
  selectedFile?: FileBrowserFolderFile | PACSFile;
  preview: "large" | "small";
  handleNext?: () => void;
  handlePrevious?: () => void;
  isHide?: boolean;

  useUser: UseThunk<DoUser.State, TDoUser>;
};

export default (props: Props) => {
  const { selectedFile, preview, isHide, useUser } = props;
  let viewerName = "";
  if (selectedFile) {
    const fileType = getFileExtension(selectedFile.data?.fname);
    if (fileType && fileViewerMap[fileType]) {
      viewerName = fileViewerMap[fileType];
    } else {
      viewerName = "CatchallDisplay";
    }
  }

  const errorComponent = (err?: string) => (
    <Label color="red">
      <Text>{err ?? "Error. Refresh or try again."}</Text>
    </Label>
  );

  console.info("FileDetailView: isHide:", isHide);

  return (
    <ViewerDisplay
      preview={preview}
      viewerName={viewerName}
      selectedFile={selectedFile}
      isHide={isHide}
      useUser={useUser}
    />
  );
};
