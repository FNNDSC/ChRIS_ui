import React, { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { useDispatch } from "react-redux";
import { PageSection } from "@patternfly/react-core";
import WrapperConnect from "../Wrapper";
import ChrisAPIClient from "../../api/chrisapiclient";
import { setIsNavOpen, setSidebarActive } from "../../store/ui/actions.ts";

import { ChNVROptions } from "./models.ts";
import { DEFAULT_OPTIONS } from "./defaults.ts";
import HeaderOptionBar from "./components/HeaderOptionBar.tsx";
import SizedNiivueCanvas, { CrosshairLocation } from "../SizedNiivueCanvas";
import { Problem, VisualDataset } from "./types.ts";
import {
  DatasetFile,
  DatasetFilesClient,
  DatasetPreClient,
  getPreClient,
  getPublicVisualDatasets,
} from "./client";
import { flexRowSpaceBetween, hideOnMobile } from "./cssUtils.ts";
import { FpClient } from "../../api/fp/chrisapi.ts";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import DatasetPageDrawer from "./components/Drawer.tsx";
import {
  InfoForPageHeader,
  ControlPanel,
  DatasetDescriptionText,
} from "./content";

/**
 * The "Visual Datasets Viewer" is a view of ChRIS_ui which implements a
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
const VisualDatasets: React.FunctionComponent = () => {
  const dispatch = useDispatch();

  const [datasets, setDatasets] = useState<VisualDataset[] | null>(null);
  const [dataset, setDataset] = useState<VisualDataset | null>(null);

  const [nvOptions, setNvOptions] = useImmer<ChNVROptions>(DEFAULT_OPTIONS);
  const [nvSize, setNvSize] = useState(10);
  const [sizeIsScaling, setSizeIsScaling] = useState(false);

  const [crosshairLocation, setCrosshairLocation] = useState<CrosshairLocation>(
    { string: "" },
  );

  const client = new FpClient(ChrisAPIClient.getClient());

  const [problems, setProblems] = useState<Problem[]>([]);
  const pushProblem = (p: Problem) => setProblems([...problems, p]);
  const pushProblems = (p: Problem[]) => setProblems(problems.concat(p));

  // EFFECTS
  // --------------------------------------------------------------------------------

  // when the web app is ready, hide the sidebar and set the page title.
  React.useEffect(() => {
    document.title = "Fetal MRI Viewer";
    dispatch(setIsNavOpen(false));
    dispatch(
      setSidebarActive({
        activeItem: "niivue",
      }),
    );
  }, [dispatch]);

  // on first load, get all the public feeds containing public datasets.
  useEffect(() => {
    getPublicVisualDatasets(client)().then(({ datasets, errors }) => {
      setDatasets(datasets);
      pushProblems(errors);
    });
  }, []);

  // once datasets have been found, automatically select the first dataset.
  useEffect(() => {
    if (datasets === null) {
      setDataset(null);
      return;
    }
    if (dataset === null) {
      if (datasets.length === 0) {
        pushProblem({
          variant: "warning",
          title: "No public datasets found.",
          body: (
            <span>
              To add a public dataset, follow these instructions:{" "}
              <a
                href="https://chrisproject.org/docs/public_dataset_browser"
                target="_blank"
              >
                https://chrisproject.org/docs/public_dataset_browser
              </a>
            </span>
          ),
        });
      } else {
        setDataset(datasets[0]);
      }
    }
  }, [datasets]);

  /**
   * Dataset README.txt file content.
   *
   * - `null` represents README not loaded
   * - empty represents README is empty OR dataset does not have a README
   */
  const [readme, setReadme] = React.useState<string | null>(null);
  /**
   * Viewable files of a dataset.
   */
  const [files, setFiles] = React.useState<ReadonlyArray<DatasetFile> | null>(
    null,
  );
  /**
   * All the tag keys and all of their possible values for a dataset.
   */
  const [tagsDictionary, setTagsDictionary] = React.useState<{
    [key: string]: string[];
  } | null>(null);

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

  // when a dataset is selected, get its readme, tags dictionary, and files
  useEffect(() => {
    if (dataset === null) {
      setReadme(null);
      setFiles(null);
      setTagsDictionary(null);
      return;
    }
    const task = pipe(
      getPreClient(client, dataset),
      TE.map(fetchAndSetReadme),
      TE.flatMap((preClient) => preClient.getFilesClient()),
      TE.map(tapSetTagsDictionary),
      TE.map((filesClient) => filesClient.listFiles()),
      TE.match(pushProblem, setFiles),
    );
    task();
  }, [dataset]);

  // ELEMENT
  // --------------------------------------------------------------------------------

  const controlPanel = (
    <ControlPanel problems={problems} crosshairLocation={crosshairLocation} />
  );

  const datasetDescriptionText = (
    <DatasetDescriptionText feed={dataset?.feed || null} readme={readme} />
  );

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
            options={nvOptions}
            volumes={[]}
          />
        </DatasetPageDrawer>
      </PageSection>
    </WrapperConnect>
  );
};

export default VisualDatasets;
