import type { PacsPreferences } from "./types.ts";

const DEFAULT_PREFERENCES: PacsPreferences = {
  showUid: false,
  dateFormat: "yyyy MMM dd",
};

Object.freeze(DEFAULT_PREFERENCES);

export { DEFAULT_PREFERENCES };
