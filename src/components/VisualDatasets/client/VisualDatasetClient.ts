import { Option } from "fp-ts/Option";
import { ManifestData } from "./models.ts";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { FpClient } from "../../../api/fp-chrisapi.ts";
import { VisualDataset } from "../types.ts";

class VisualDatasetClient {
  private readonly client: FpClient;
  private readonly feed: Feed;
  private readonly indexPlinst: PluginInstance;
  private readonly dataPlinst: PluginInstance;

  private readonly readmeFileResource: Option<string>;
  private readonly manifestFileResource: string;

  constructor(
    client: FpClient,
    dataset: VisualDataset,
    readmeFileResource: Option<string>,
    manifestFileResource: string,
  ) {
    this.client = client;
    this.feed = dataset.feed;
    this.dataPlinst = dataset.dataPlinst;
    this.indexPlinst = dataset.indexPlinst;
    this.readmeFileResource = readmeFileResource;
    this.manifestFileResource = manifestFileResource;
  }
}

export default VisualDatasetClient;
