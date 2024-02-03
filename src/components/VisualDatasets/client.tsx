// Development notes:
// Too much try/catch, improve error handling somehow.

import Client, { Feed, PluginInstance, Collection } from "@fnndsc/chrisapi";
import { VisualDataset } from "./types.ts";
import ProblemsManager from "./problems.ts";
import { FilebrowserFile, Sidecar, VisualDatasetFile } from "./models.ts";
import { pairNiftisWithAssociatedOptions } from "./associatedOptions.ts";
import { DEFAULT_VOLUME } from "./defaults.ts";

// Pagination is currently not implemented anywhere.
// When number of resources returned > limit, please call ProblemManager.pushOnce

/**
 * A file created by `pl-visual-dataset`.
 */
const MAGIC_PUBLIC_DATASET_FILENAME = '.chrisvisualdataset.root.json';
/**
 * Maximum number of public visual datasets to search for.
 */
const FEEDS_SEARCH_LIMIT = 10;
/**
 * Maximum number of plugin instances to query for per feed.
 */
const PLUGININSTANCES_LIMIT = 20;
/**
 * Maximum number of plugin instances to query for per subject.
 */
const FILES_PER_SUBJECT_LIMIT = 20;


/**
 * Contacts CUBE to search for datasets conformant to the "Visual Dataset"
 * conventions described here:
 *
 * https://chrisproject.org/docs/visual_dataset
 */
class VisualDatasetsClient {

  private readonly client: Client;
  private readonly problems: ProblemsManager;

  /**
   * @param client ChRIS API client
   * @param problemsManager problems manager
   */
  public constructor(client: Client, problemsManager: ProblemsManager) {
    this.client = client;
    this.problems = problemsManager;
  }

  /**
   * Search CUBE for "visual datasets."
   *
   * In the current version, this feature is subject to constraints:
   * feeds containing "visual datasets" must...
   *
   * - be public
   * - have exactly one plugin instance of pl-visual-dataset
   * - total to fewer than 10 feeds
   *
   * This function notifies the component of any problems by calling
   * the `problemsHook` callback function.
   *
   * In the future, we might want to consider:
   *
   * - pagination: what if we have 20, 100, 1000 visual datasets?
   * - private visual datasets?
   */
  public async getVisualDatasetFeeds(): Promise<VisualDataset[]> {
    const searchParams = {
      files_fname_icontains: MAGIC_PUBLIC_DATASET_FILENAME,
      limit: FEEDS_SEARCH_LIMIT
    };

    try {
      const feedsCollection = await this.client.getPublicFeeds(searchParams);
      if (feedsCollection.totalCount > 10) {
        this.problems.pushOnce({
          variant: 'warning',
          title: 'More than 10 feeds found.',
          body: 'Since pagination is not implemented yet, not all of them are shown.'
        });
      }
      const feeds = feedsCollection.getItems() as Feed[];
      const plinstPromises = feeds.map((feed) => this.getVisualDatasetPluginInstances(feed));
      const feedsAndVisualDatasets = await Promise.all(plinstPromises);
      return feedsAndVisualDatasets.filter(isNotNull);
    } catch (e) {
      this.problems.push({
        variant: "danger",
        title: 'Could not load feeds.'
      });
      throw e;
    }
  }

  /**
   * Find instances of `pl-public-dataset` in a feed.
   * @private
   */
  private async getVisualDatasetPluginInstances(feed: Feed): Promise<VisualDataset | null> {
    // N.B. it would be more efficient to hit api/v1/plugins/instances/search/
    // instead of api/v1/N/plugininstances/, however CUBE doesn't let
    // anonymous users do that.
    // See https://github.com/FNNDSC/ChRIS_ultron_backEnd/issues/530
    const plinstCollection = await feed.getPluginInstances({limit: PLUGININSTANCES_LIMIT});
    const plinsts = plinstCollection.getItems() as PluginInstance[];
    const plugininstance = plinsts.find((plinst) => plinst.data.plugin_name === 'pl-visual-dataset');

    if (plugininstance !== undefined) {
      return { feed, plugininstance };
    }

    if (plinstCollection.totalCount > PLUGININSTANCES_LIMIT) {
      this.problems.push({
        variant: 'warning',
        title: `Feed ${feed.data.id} not thoroughly checked`,
        body: (<div>
          No instance of plugin pl-visual-dataset was found in the{' '}
          {PLUGININSTANCES_LIMIT} most recent plugin instances of the
          feed titled "{feed.data.name}". Even though it might contain
          a public visual dataset, the feed will not show up here because
          I am lazy.
        </div>)
      });
    }
    return null;
  }

  /**
   * Get one feed from the given list, and show warnings if the list
   * does not contain exactly one feed.
   */
  public getOneDatasetFrom(datasets: VisualDataset[]): VisualDataset | null {
    if (datasets.length === 0) {
      this.problems.pushOnce({
        variant: "warning",
        title: 'No public datasets found.',
        body: (<span>
          To add a public dataset, follow these instructions:{' '}
          <a href="https://chrisproject.org/docs/public_dataset_browser" target="_blank">
            https://chrisproject.org/docs/public_dataset_browser
          </a>
        </span>)
      });
      return null;
    }
    if (datasets.length > 1) {
      this.problems.pushOnce({
        variant: "warning",
        title: "Multiple feeds found",
        body: (<>
          <p>Found public datasets in the following feeds:</p>
          <pre>{JSON.stringify(datasets.map((dataset) => dataset.feed.data.name))}</pre>
          <p>Currently it is not possible to show any other feed besides the first.</p>
        </>)
      });
    }
    return datasets[0];
  }

  /**
   * Get subject names (top-level directory names) found in a plugin instance.
   */
  public async listSubjects(plinst: PluginInstance): Promise<string[] | null> {
    try {
      const fbp = await this.client.getFileBrowserPath(plinst.data.output_path);
      return JSON.parse(fbp.data.subfolders);
    } catch (e) {
      this.problems.pushOnce({
        variant: "danger",
        title: `Can't get subjects from plugininstance=${plinst.data.id}`,
        body: (<>
          <p>
            filebrowser API request failed for whatever reason searching
          </p>
          <pre>{plinst.data.output_path}</pre>
        </>)
      });
      throw e;
    }
  }

  /**
   * Get the files of a subject in a visual dataset, along with their
   * default options (optionally specified in a `.chrisvisualdataset.volume.json`
   * sidecar file).
   */
  public async getFiles(plinst: PluginInstance, subjectName: string): Promise<VisualDatasetFile[]> {
    const files = await this.getFilesFromFilebrowser(plinst, subjectName);
    const pairs = pairNiftisWithAssociatedOptions(files);
    const getOptionsPromises = pairs.map(async ({nifti, option}) => {
      const sidecar = option === null ? {} : await badlyFetchFileResource(option);
      const defaultSettings = { ...DEFAULT_VOLUME, ...sidecar.niivue_defaults };
      const currentSettings = {...defaultSettings, url: nifti.file_resource};
      return {
        name: sidecar.name || null,
        author: sidecar.author || null,
        description: sidecar.description || null,
        citation: sidecar.citation || [],
        website: sidecar.website || null,
        file: nifti,
        defaultSettings,
        currentSettings
      };
    });
    const datasetFiles = await Promise.all(getOptionsPromises);
    datasetFiles.sort(compareVisualDatasetFile);
    return datasetFiles;
  }

  private async getFilesFromFilebrowser(plinst: PluginInstance, subjectName: string): Promise<FilebrowserFile[]> {
    const subjectDir = `${plinst.data.output_path}/${subjectName}`;
    try {
      const fbp = await this.client.getFileBrowserPath(subjectDir);
      const fileCollection = await fbp.getFiles({limit: FILES_PER_SUBJECT_LIMIT});
      if (fileCollection.totalCount > FILES_PER_SUBJECT_LIMIT) {
        this.problems.pushOnce({
          variant: "warning",
          title: `More than ${FILES_PER_SUBJECT_LIMIT} found for subject ${plinst.data.id}/${subjectName}`,
          body: `The path ${subjectDir} contains ${fileCollection.totalCount} files, which is too many for me to handle.`
        });
      }
      return fileCollection.getItems()!.map(stupidlyUncollectionifyFilebrowserFile);
    } catch (e) {
      this.problems.pushOnce({
        variant: "danger",
        title: `Could not list files from ${subjectDir}`,
      });
      throw e;
    }
  }
}

async function badlyFetchFileResource(option: FilebrowserFile): Promise<Sidecar> {
  // Very bad smell: contacting CUBE without using the client.
  const res = await fetch(option.file_resource);
  return await res.json();
}

function isNotNull<T>(x: T | null): x is T {
  return x !== null;
}


function stupidlyUncollectionifyFilebrowserFile(data: any): FilebrowserFile {
  return {
    ...Collection.getItemDescriptors(data.collection.items[0]),
    file_resource: Collection.getLinkRelationUrls(data.collection.items[0], 'file_resource')[0]
  };
}

/**
 * A hard-coded comparison function for sorting so that "T2 MRI" is always
 * put in the front of the list, so that Niivue renders them at the bottom
 * of the stack.
 */
function compareVisualDatasetFile(a: VisualDatasetFile, b: VisualDatasetFile): number {
  if (a.name?.includes("T2 MRI")) {
    return -1;
  }
  if (b.name?.includes("T2 MRI")) {
    return 1;
  }
  return 0; // order of everything else doesn't matter
}

export default VisualDatasetsClient;
