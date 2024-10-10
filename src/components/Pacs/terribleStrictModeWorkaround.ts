import React from "react";

/**
 * A wrapper around {@link React.useRef} to detect when something is called
 * more than once. Useful as a workaround to how {@link React.StrictMode}
 * makes effects run twice.
 *
 * @returns an impure predicate, returning `true` the first time `x` is given,
 *          and `false` for every subsequent call on the same `x`.
 */
export default function terribleStrictModeWorkaround<T>(): (x: T) => boolean {
  const set = React.useRef(new Set());
  return React.useCallback(
    (x) => {
      const has = set.current.has(x);
      set.current.add(x);
      return !has;
    },
    [set.current],
  );
}
