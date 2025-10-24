import type { DraftFunction, Updater } from "use-immer";

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

/**
 * Wraps a React state hook so that it no longer accepts the null type.
 */
function notNullSetState<S>(
  setState: React.Dispatch<React.SetStateAction<S | null>>,
): React.Dispatch<React.SetStateAction<S>> {
  return (action) => {
    if (isSetStateCallback(action)) {
      setState((prev) => {
        if (prev === null) {
          throw TypeError(`The function ${setState.name} does not accept null`);
        }
        return action(prev);
      });
    }
    if (action === null) {
      throw TypeError(`The function ${setState.name} does not accept null`);
    }
    return setState(action as S);
  };
}

function isSetStateCallback<S>(
  action: React.SetStateAction<S>,
): action is (prevState: S) => S {
  return typeof action === "function";
}

function isDraftFunction<T>(
  update: T | DraftFunction<T>,
): update is DraftFunction<T> {
  return typeof update === "function";
}

export { nullUpdaterGuard, notNullSetState };
