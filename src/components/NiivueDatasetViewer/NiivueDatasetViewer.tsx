import React, { useEffect, useMemo, useState } from "react";
import { useImmer } from "use-immer";
import { PageSection } from "@patternfly/react-core";
import WrapperConnect from "../Wrapper";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { ChNVROptions, ChNVRVolume } from "./models";
import { DEFAULT_OPTIONS } from "./defaults";
import HeaderOptionBar from "./components/HeaderOptionBar";
import SizedNiivueCanvas, {
  type CrosshairLocation,
} from "../SizedNiivueCanvas";
import type { Problem, TagsDictionary, VisualDataset } from "./types";
import {
  type DatasetFile,
  type DatasetFilesClient,
  type DatasetPreClient,
  getDataset,
  getPreClient,
} from "./client";
import { flexRowSpaceBetween, hideOnMobile } from "../../cssUtils.ts";
import { FpClient } from "../../api/fp/chrisapi";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import DatasetPageDrawer from "./components/Drawer";
import {
  InfoForPageHeader,
  ControlPanel,
  DatasetDescriptionText,
} from "./content";
import { parsePluginInstanceId } from "./client/helpers";
import { getFeedOf } from "./client/getDataset";
import type { Feed } from "@fnndsc/chrisapi";
import {
  type DatasetFileState,
  type DatasetVolume,
  files2states,
  volumeIsLoaded,
} from "./statefulTypes";
import { notNullSetState } from "./helpers";
import styles from "./NiivueDatasetViewer.module.css";
import { css } from "@patternfly/react-styles";
import BackgroundColor from "@patternfly/react-styles/css/utilities/BackgroundColor/BackgroundColor";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";

/**
 * The "Niivue Datasets Viewer" is a view of ChRIS_ui which implements a
 * visualizer component for feeds containing datasets conforming to the
 * "visual dataset" specification described here:
 *
 * https://chrisproject.org/docs/visual_dataset
 *
 * It is a wrapper around Niivue, providing controls for Niivue's settings
 * and logic for feeding data from CUBE to Niivue.
 *
 * The primary purpose of the "Visual Datasets Viewer" is to power
 * http://fetalmri.org. Nonetheless, the "Visual Datasets Browser"
 * is generally useful for other datasets of 3D medical images.
 */
const NiivueDatasetViewer: React.FC<{ plinstId: string }> = ({ plinstId }) => {
  const [dataset, setDataset] = useState<VisualDataset | null>(null);
  const [feed, setFeed] = useState<Feed | null>(null);
  /**
   * Dataset README.txt file content.
   *
   * - `null` represents README not loaded
   * - empty represents README is empty OR dataset does not have a README
   */
  const [readme, setReadme] = useState<string | null>(null);
  /**
   * Viewable files of a dataset.
   */
  const [fileStates, setFileStates] =
    useState<ReadonlyArray<DatasetFileState> | null>(null);
  /**
   * All the tag keys and all of their possible values for a dataset.
   */
  const [tagsDictionary, setTagsDictionary] = useState<TagsDictionary>({});

  const [firstRunFiles, setFirstRunFiles] = useState<number[] | null>(null);

  const [nvOptions, setNvOptions] = useImmer<ChNVROptions>(DEFAULT_OPTIONS);
  const [nvSize, setNvSize] = useState(10);
  const [sizeIsScaling, setSizeIsScaling] = useState(false);
  const [crosshairLocation, setCrosshairLocation] = useState<CrosshairLocation>(
    { string: "" },
  );

  const client = useMemo(() => new FpClient(ChrisAPIClient.getClient()), []);

  const [problems, setProblems] = useState<Problem[]>([]);
  const pushProblem = (p: Problem) => setProblems([...problems, p]);
  const pushProblems = (p: Problem[]) => setProblems(problems.concat(p));

  // VOLUME LOADING HELPER FUNCTIONS
  // --------------------------------------------------------------------------------

  /**
   * Update the state of a file with the given path.
   */
  const updateStateAt = (
    path: string,
    updater: (fileState: DatasetFileState) => DatasetFileState,
  ) => {
    notNullSetState(setFileStates)((prev) =>
      prev.map((fileState) =>
        fileState.file.path === path ? updater(fileState) : fileState,
      ),
    );
  };

  /**
   * Curried function for setting the volume state of a dataset file.
   */
  const setFreshVolumeOf = (
    path: string,
  ): ((x: {
    problems: Problem[];
    volume: ChNVRVolume;
    colormapLabelFile?: string;
  }) => void) => {
    return ({ problems, volume, colormapLabelFile }) => {
      if (problems.length > 0) {
        pushProblems(problems);
      }
      updateStateAt(path, (fileState) => {
        return {
          ...fileState,
          volume: copyPropertiesToDefault(volume, colormapLabelFile),
        };
      });
    };
  };

  /**
   * Request then set the file volume's URL asynchronously.
   */
  const startLoadingVolume = (file: DatasetFile) => {
    const task = pipe(
      file.getVolume(),
      TE.match(pushProblem, setFreshVolumeOf(file.path)),
    );
    task();
  };

  // EFFECTS
  // --------------------------------------------------------------------------------

  // when the web app is ready, hide the sidebar and set the page title.
  React.useEffect(() => {
    document.title = "Volume View";
  }, []);

  // on first load, get the dataset's plugin instances.
  useEffect(() => {
    const task = pipe(
      plinstId,
      parsePluginInstanceId,
      TE.fromEither,
      TE.flatMap((id) => getDataset(client, id)),
      TE.match(pushProblem, setDataset),
    );
    task();
  }, [plinstId]);

  // when a dataset is selected, get its feed, readme, tags dictionary, and files
  useEffect(() => {
    if (dataset === null) {
      setReadme(null);
      setFileStates(null);
      setTagsDictionary({});
      return;
    }

    const fetchAndSetReadme = (preClient: DatasetPreClient) => {
      const task = pipe(
        preClient.getReadme(),
        // if dataset does not have a README, set README as empty
        O.getOrElse(() => TE.of("")),
        TE.match(pushProblem, setReadme),
      );
      task();
      return preClient;
    };

    const tapSetTagsDictionary = (filesClient: DatasetFilesClient) => {
      setTagsDictionary(filesClient.tagsDictionary);
      return filesClient;
    };

    const tapSetFirstRunFiles = (filesClient: DatasetFilesClient) => {
      setFirstRunFiles(filesClient.firstRunFiles);
      return filesClient;
    };

    if (fileStates === null) {
      const task = pipe(
        getPreClient(client, dataset),
        TE.map(fetchAndSetReadme),
        TE.flatMap((preClient) => preClient.getFilesClient()),
        TE.map(tapSetTagsDictionary),
        TE.map(tapSetFirstRunFiles),
        TE.map((filesClient) => filesClient.listFiles()),
        TE.map(files2states),
        TE.match(pushProblem, setFileStates),
      );
      task();
    }
    if (feed === null) {
      const task = pipe(
        getFeedOf(dataset.indexPlinst),
        TE.match(pushProblem, setFeed),
      );
      task();
    }
  }, [dataset]);

  // Show pre-selected volumes.
  useEffect(() => {
    if (fileStates === null) {
      return;
    }
    if (fileStates.filter(volumeIsLoaded).length > 0) {
      return;
    }
    if (firstRunFiles === null) {
      return;
    }
    setFileStates((prev) => {
      if (prev === null) {
        return null;
      }
      return prev.map((fileState, i) => {
        if (firstRunFiles.findIndex((j) => i === j) === -1) {
          return fileState;
        }
        if (fileState.volume !== null) {
          return fileState;
        }
        // by setting volume to "pleaseLoadMe", <FilesMenu> is notified
        // to start loading its file.
        return { ...fileState, volume: "pleaseLoadMe" };
      });
    });
  }, [firstRunFiles]);

  // Load files whose volume have the value "pleaseLoadMe".
  React.useEffect(() => {
    if (fileStates === null) {
      return;
    }
    let needsLoad = false;
    const nextState = fileStates.map((fileState): DatasetFileState => {
      if (fileState.volume === "pleaseLoadMe") {
        needsLoad = true;
        startLoadingVolume(fileState.file);
        return { ...fileState, volume: "loading" };
      }
      return fileState;
    });
    if (needsLoad) {
      setFileStates(nextState);
    }
  }, [fileStates]);

  const loadingText = React.useMemo(() => {
    if (fileStates === null) {
      return "Waiting for images...";
    }
    if (fileStates.findIndex(volumeIsLoaded) === -1) {
      return "Select an image in the sidebar.";
    }
    return "Loading images...";
  }, [fileStates]);

  // ELEMENT
  // --------------------------------------------------------------------------------

  const controlPanel = (
    <ControlPanel
      problems={problems}
      fileStates={fileStates}
      setFileStates={notNullSetState(setFileStates)}
      tagsDictionary={tagsDictionary}
      options={nvOptions}
      setOptions={setNvOptions}
      size={nvSize}
      setSize={setNvSize}
      sizeIsScaling={sizeIsScaling}
      setSizeIsScaling={setSizeIsScaling}
    />
  );

  const datasetDescriptionText = (
    <DatasetDescriptionText feed={feed} readme={readme} />
  );

  const volumes =
    fileStates === null
      ? []
      : fileStates
          .filter(volumeIsLoaded)
          .map((fileState) => fileState.volume)
          .map(({ state }) => state);

  return (
    <WrapperConnect>
      <PageSection>
        <div className={hideOnMobile}>
          <div className={flexRowSpaceBetween}>
            <InfoForPageHeader />
            <HeaderOptionBar options={nvOptions} setOptions={setNvOptions} />
          </div>
        </div>
      </PageSection>

      <PageSection isFilled padding={{ default: "noPadding" }}>
        <DatasetPageDrawer head={datasetDescriptionText} side={controlPanel}>
          <SizedNiivueCanvas
            size={nvSize}
            isScaling={sizeIsScaling}
            onLocationChange={setCrosshairLocation}
            options={{ ...nvOptions, loadingText }}
            volumes={volumes}
          />
          <div
            className={css(
              styles.bottomFooter,
              BackgroundColor.backgroundColor_200,
              Spacing.pSm,
            )}
          >
            Location: {crosshairLocation.string}
          </div>
        </DatasetPageDrawer>
      </PageSection>
    </WrapperConnect>
  );
};

/**
 * Copy the properties of the given volume over to an object called "default".
 */
function copyPropertiesToDefault(
  volume: ChNVRVolume,
  colormapLabelFile: string | undefined,
): DatasetVolume {
  const { url: _url, ...rest } = volume;
  return { state: volume, default: { ...rest, colormapLabelFile } };
}

export default NiivueDatasetViewer;
