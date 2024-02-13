import { Option } from "fp-ts/Option";
import { ManifestData } from "./models.ts";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { FpClient } from "../../../api/fp-chrisapi.ts";
import { VisualDataset } from "../types.ts";
import FpFileBrowserFile from "../../../api/fp/fpFileBrowserFile.ts";

class VisualDatasetClient {
  private readonly client: FpClient;
  private readonly feed: Feed;
  private readonly indexPlinst: PluginInstance;
  private readonly dataPlinst: PluginInstance;

  private readonly readmeFile: Option<FpFileBrowserFile>;
  private readonly manifestFile: FpFileBrowserFile;

  constructor(
    client: FpClient,
    dataset: VisualDataset,
    readmeFile: Option<FpFileBrowserFile>,
    manifestFile: FpFileBrowserFile,
  ) {
    this.client = client;
    this.feed = dataset.feed;
    this.dataPlinst = dataset.dataPlinst;
    this.indexPlinst = dataset.indexPlinst;
    this.readmeFile = readmeFile;
    this.manifestFile = manifestFile;
  }
}

export default VisualDatasetClient;
