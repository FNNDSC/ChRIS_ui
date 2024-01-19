import { CVDVolume } from "./options.tsx";
import { Collection, FeedFile } from "@fnndsc/chrisapi";

function hideColorBarofInvisibleVolume(v: CVDVolume): CVDVolume {
  return v.opacity === 0.0 ? {...v, colorbarVisible: false} : v;
}

/**
 * https://github.com/FNNDSC/fnndsc/blob/26f4345a99c4486faedb732afe16fc1f14265d54/js/chrisAPI/src/feedfile.js#L38C1-L39
 */
function fileResourceUrlOf(file: FeedFile): string {
  const item = file.collection.items[0];
  return Collection.getLinkRelationUrls(item, 'file_resource')[0];
}

export { hideColorBarofInvisibleVolume, fileResourceUrlOf };
