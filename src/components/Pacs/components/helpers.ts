import {
  extract as extractFromNonEmpty,
  type ReadonlyNonEmptyArray,
} from "fp-ts/ReadonlyNonEmptyArray";
import type { useSearchParams } from "react-router-dom";
import { type PacsSeriesState, SeriesPullState } from "../types.ts";

/**
 * Adapt {@link useSearchParams} to work like `React.useState<boolean>(false)`
 */
function useBooleanSearchParam(
  useSearchParamsHooks: ReturnType<typeof useSearchParams>,
  key: string,
): [boolean, (value: boolean) => void] {
  const [searchParams, setSearchParams] = useSearchParamsHooks;
  const current = searchParams.get(key) === "y";
  const setValue = (value: boolean) => {
    setSearchParams((searchParams) => {
      if (value) {
        searchParams.set(key, "y");
      } else {
        searchParams.delete(key);
      }
      return searchParams;
    });
  };
  return [current, setValue];
}

/**
 * Selects the default PACS service (which is usually not the PACS service literally called "default").
 *
 * 1. Selects the hard-coded "PACSDCM"
 * 2. Attempts to select the first value which is not "default" (a useless, legacy pfdcm behavior)
 * 3. Selects the first value
 */
function getDefaultPacsService(
  services: ReadonlyNonEmptyArray<string>,
): string {
  if (services.includes("PACSDCM")) {
    return "PACSDCM";
  }
  for (const service of services) {
    if (service !== "default") {
      return service;
    }
  }
  return extractFromNonEmpty(services);
}

function isSeriesLoading({
  pullState,
  inCube,
  info,
}: Pick<PacsSeriesState, "pullState" | "inCube" | "info">): boolean {
  const numberOfSeriesRelatedInstances =
    info.NumberOfSeriesRelatedInstances || 0;
  if (numberOfSeriesRelatedInstances === 0) {
    return false;
  }
  if (pullState === SeriesPullState.WAITING_OR_COMPLETE) {
    return inCube === null;
  }
  return (
    pullState === SeriesPullState.CHECKING ||
    pullState === SeriesPullState.PULLING
  );
}

export { useBooleanSearchParam, getDefaultPacsService, isSeriesLoading };
