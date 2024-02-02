import { ChNVRVolume } from "./options.tsx";
import { Collection, FeedFile } from "@fnndsc/chrisapi";
import { DraftFunction, Updater } from "use-immer";
import { isDraftable } from "immer";

function hideColorBarofInvisibleVolume(v: ChNVRVolume): ChNVRVolume {
  return v.opacity === 0.0 ? {...v, colorbarVisible: false} : v;
}

/**
 * https://github.com/FNNDSC/fnndsc/blob/26f4345a99c4486faedb732afe16fc1f14265d54/js/chrisAPI/src/feedfile.js#L38C1-L39
 */
function fileResourceUrlOf(file: FeedFile): string {
  const item = file.collection.items[0];
  return Collection.getLinkRelationUrls(item, 'file_resource')[0];
}

/**
 * Wrap an `Updater` to be used in contexts where you are sure `x` is not `null`.
 */
function nullUpdaterGuard<T>(updater: Updater<T | null>): Updater<T> {
  return (update) => {
    if (isDraftFunction(update)) {
      return updater((draft) => {
        if (draft === null) {
          throw Error('draft is null');
        }
        update(draft);
      });
    } else {
      updater(update);
    }
  };
}

function isDraftFunction<T>(update: T | DraftFunction<T>): update is DraftFunction<T> {
  return typeof update === "function";
}

export { hideColorBarofInvisibleVolume, fileResourceUrlOf, nullUpdaterGuard };
