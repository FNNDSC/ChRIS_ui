/**
 * Advice for readers: the coding style of this module is dramatically
 * different from the rest of the ChRIS_ui codebase due to using `fp-ts`.
 * `fp-ts` greatly simplifies error handling. For those unfamiliar with
 * `fp-ts`, you can mostly understand the code by only reading function
 * names and ignoring the `fp-ts` plumbing. To help with this I have
 * left many inline comments in plain English.
 */

export { getPublicVisualDatasets } from "./getDatasets";
