import { DraftFunction, Updater } from "use-immer";

/**
 * Wrap an `Updater` to be used in contexts where you are sure `x` is not `null`.
 */
function nullUpdaterGuard<T>(updater: Updater<T | null>): Updater<T> {
  return (update) => {
    if (isDraftFunction(update)) {
      return updater((draft) => {
        if (draft === null) {
          throw Error("draft is null");
        }
        update(draft);
      });
    } else {
      updater(update);
    }
  };
}

function isDraftFunction<T>(
  update: T | DraftFunction<T>,
): update is DraftFunction<T> {
  return typeof update === "function";
}

export { nullUpdaterGuard };
