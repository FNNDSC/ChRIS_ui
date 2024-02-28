import { FileBrowserPathFileList } from "@fnndsc/chrisapi";
import data from "./plVisualDatasetFilebrowserFiles.json";
import { saneReturnOfFileBrowserPathFileList } from "../../../../api/fp/chrisapi.ts";
import FpFileBrowserFile from "../../../../api/fp/fpFileBrowserFile.ts";

function getPlVisualDatasetFilebrowserFileList(): FileBrowserPathFileList {
  const list = new FileBrowserPathFileList("https://example.org", {
    token: "i am a mock, I have no token",
  });
  list.collection = data.collection;
  return list;
}

function getSanePlVisualDatasetFiles(): ReadonlyArray<FpFileBrowserFile> {
  const data = getPlVisualDatasetFilebrowserFileList();
  return saneReturnOfFileBrowserPathFileList(data);
}

export { getPlVisualDatasetFilebrowserFileList, getSanePlVisualDatasetFiles };
