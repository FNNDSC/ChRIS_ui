import {
  ChrisViewerFileOptions,
  Manifest,
  OptionsLink,
  TagSet,
} from "./models.ts";
import { PluginInstance } from "@fnndsc/chrisapi";
import { FpClient } from "../../../api/fp/chrisapi.ts";
import { filter, foldMap } from "fp-ts/ReadonlyArray";
import { Monoid } from "fp-ts/Monoid";
import { DatasetFile } from "./DatasetFile.ts";
import { pipe } from "fp-ts/function";

const optionsJoin: Monoid<ChrisViewerFileOptions> = {
  concat: (a, b) => {
    return { ...a, ...b };
  },
  empty: {},
};

/**
 * A client for getting files, tags, and file metadata for a manifest.
 */
class DatasetFilesClient {
  private readonly client: FpClient;
  private readonly dataPlinst: PluginInstance;
  private readonly indexPlinst: PluginInstance;
  private readonly manifest: Manifest;

  constructor(
    client: FpClient,
    dataPlinst: PluginInstance,
    indexPlinst: PluginInstance,
    manifest: Manifest,
  ) {
    this.client = client;
    this.dataPlinst = dataPlinst;
    this.indexPlinst = indexPlinst;
    this.manifest = manifest;
  }

  /**
   * Get the viewable files of this dataset.
   */
  listFiles(): ReadonlyArray<DatasetFile> {
    return this.manifest.files.map((fileInfo) => {
      return new DatasetFile(
        this.client,
        fileInfo,
        matchOptionsTo(fileInfo.tags, this.manifest.options),
        this.dataPlinst.data.output_path,
        this.indexPlinst.data.output_path,
      );
    });
  }

  /**
   * Get all tag keys and all of their possible values.
   */
  get tagsDictionary(): { [key: string]: string[] } {
    return this.manifest.tags;
  }
}

/**
 * Get all the options from the manifest associated with a set of tags.
 */
function matchOptionsTo(
  tags: TagSet,
  options: ReadonlyArray<OptionsLink>,
): ChrisViewerFileOptions {
  return pipe(
    options,
    filter(({ match }) => isSubset(tags, match)),
    foldMap(optionsJoin)((optionsLink) => optionsLink.options),
  );
  // we aren't doing any validation of whether multiple option fields
  // are matched to the file, e.g. if a file has "name" defined twice.
  // pl-visual-dataset checks for that already.
}

/**
 * Are `match` a subset of `tags`?
 */
function isSubset(tags: TagSet, match: TagSet): boolean {
  for (const [key, value] of Object.entries(match)) {
    if (!(key in tags)) {
      return false;
    }
    if (tags[key] !== value) {
      return false;
    }
  }
  return true;
}

export { DatasetFilesClient, isSubset, matchOptionsTo };
