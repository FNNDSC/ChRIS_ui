/**
 * Advice for readers: the coding style of this module is dramatically
 * different from the rest of the ChRIS_ui codebase due to using `fp-ts`.
 * `fp-ts` greatly simplifies error handling. For those unfamiliar with
 * `fp-ts`, you can mostly understand the code by only reading function
 * names and ignoring the `fp-ts` plumbing. To help with this I have
 * left many inline comments in plain English.
 */

// HOW IT ALL WORKS

// Step 1. Get list of datasets from CUBE.
export { getPublicVisualDatasets } from "./getDatasets";

// Step 2. For each dataset, get a "Pre" client, which gets the manifest
//         and README.txt for each dataset.
export { getPreClient } from "./getPreClient.ts";
export { DatasetPreClient } from "./DatasetPreClient.ts";

// Step 3. Use the "Pre" client to get the "Full" "Files" client which gets
//         has methods for getting the files of its dataset.
