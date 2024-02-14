/*
 * Advice for readers: the coding style of this module is dramatically
 * different from the rest of the ChRIS_ui codebase due to using `fp-ts`.
 * `fp-ts` greatly simplifies error handling. For those unfamiliar with
 * `fp-ts`, you can mostly understand the code by only reading function
 * names and ignoring the `fp-ts` plumbing. To help with this I have
 * left many inline comments in plain English.
 *
 * fp-ts/TaskEither.ts PRIMER
 *
 * I highly recommend this dude on YouTube.
 *   --> https://www.youtube.com/watch?v=o91UKmLwBOk
 *
 * The most common type you'll see is `TE.TaskEither`, which is the
 * return type of an async function that might fail. For example,
 * all HTTP requests should be represented by `TE.TaskEither` since
 * HTTP requests can fail for any number of reasons: internet offline,
 * no authorization, ... By wrapping async fallible function return
 * types with `TE.TaskEither`, we can safely use their values by
 * handling all possible errors, but without interleaving our code
 * with try/catch blocks.
 *
 * (Oversimplified) Within the context of `TE.map` and `TE.flatMap`
 * blocks, we are able to use the value of a `TE.TaskEither` without
 * worrying about errors. We are able to write code safely because
 * type-checking guarantees it.
 *
 * The function `TE.mapLeft` adds context to errors which might occur.
 * For example, when a HTTP request to a plugin instance fails,
 * `TE.mapLeft` might be used to create an error message with the
 * plugin instance's feed's name.
 */

// HOW IT ALL WORKS

// Step 1. Get list of datasets from CUBE.
export { getPublicVisualDatasets } from "./getDatasets";

// Step 2. For each dataset, get a "Pre" client, which gets the manifest
//         and README.txt for each dataset.
export { getPreClient } from "./getPreClient";
export { DatasetPreClient } from "./DatasetPreClient";

// Step 3. Use the "Pre" client to get the "Files" client which gets
//         has methods for getting the files of its dataset.
export { DatasetFilesClient } from "./DatasetFilesClient";

// Step 4. The "DatasetFilesClient" produces DatasetFiles, which can
//         obtain the information necessary to render files with NiiVue.
export { DatasetFile } from "./DatasetFile";
