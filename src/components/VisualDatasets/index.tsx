import React, { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { useDispatch } from "react-redux";
import { Alert, Chip, PageSection, Popover } from "@patternfly/react-core";
import BUILD_VERSION from "../../getBuildVersion";
import { BrainIcon, DesktopIcon } from "@patternfly/react-icons";
import { Typography } from "antd";

import WrapperConnect from "../Wrapper";
import { InfoIcon } from "../Common";
import ChrisAPIClient from "../../api/chrisapiclient";
import { setIsNavOpen, setSidebarActive } from "../../store/ui/actions.ts";

import styles from "./styles.module.css";
import { ChNVROptions } from "./models.ts";
import NiivueOptionsPanel from "./components/NiivueOptionsPanel.tsx";
import SelectedFilesOptionsPane from "./components/SelectedFilesOptionsPane.tsx";
import { DEFAULT_OPTIONS } from "./defaults.ts";
import HeaderOptionBar from "./components/HeaderOptionBar.tsx";
import FeedButton from "./components/FeedButton.tsx";
import {
  CrosshairLocation,
  SizedNiivueCanvas,
} from "./components/SizedNiivueCanvas.tsx";
import { Problem, VisualDataset } from "./types.ts";
import { getPublicVisualDatasets } from "./client";
import { nullUpdaterGuard } from "./helpers.ts";
import { css } from "@patternfly/react-styles";
import {
  flexRowSpaceBetween,
  hideOnDesktop,
  hideOnMobile,
  hideOnMobileInline,
} from "./cssUtils.ts";
import { FpClient } from "../../api/fp/chrisapi.ts";

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
  const feed = dataset?.feed || null;

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

  // // when a dataset is selected, get its index from pl-visual-dataset
  // useEffect(() => {
  //   if (plugininstance === null) {
  //     setSubjectNames(null);
  //     return;
  //   }
  //   visualDatasetsClient.listSubjects(plugininstance).then(setSubjectNames);
  // }, [plugininstance]);
  //
  // // when subjects become known, select a subject to display.
  // useEffect(() => {
  //   if (subjectNames === null) {
  //     setSelectedSubjectName(null);
  //     return;
  //   }
  //   // by default, select the last subject. For the fetal MRI atlases,
  //   // the last subject is probably the oldest one, which has the most
  //   // gyrification and looks the most similar to an adult brain.
  //   setSelectedSubjectName(subjectNames[subjectNames.length - 1]);
  // }, [subjectNames]);
  //
  // // whenever the selected subject is changed:
  // // 1. unload the previous subject's files.
  // // 2. load the current subject's files.
  // useEffect(() => {
  //   setFiles(null);
  //   if (selectedSubjectName === null) {
  //     return;
  //   }
  //   if (plugininstance === null) {
  //     throw new Error('Impossible for subject to be selected before plugin instance is known.');
  //   }
  //   visualDatasetsClient
  //     .getFiles(plugininstance, selectedSubjectName)
  //     .then(setFiles);
  // }, [selectedSubjectName]);

  // ELEMENT
  // --------------------------------------------------------------------------------

  return (
    <WrapperConnect>
      <PageSection>
        <div className={hideOnMobile}>
          <div className={flexRowSpaceBetween}>
            <InfoIcon
              title="Fetal MRI Atlas Viewer"
              p1={
                <Typography>
                  <p>
                    Datasets found in public feeds can be visualized here using{" "}
                    <a
                      href="https://github.com/niivue/niivue"
                      target="_blank"
                      rel="noreferrer nofollow"
                    >
                      Niivue
                    </a>
                    .
                  </p>
                  <p>
                    For how to add data here, see the documentation:
                    <a
                      href="https://chrisproject.org/docs/public_dataset_viewer"
                      target="_blank"
                      rel="noreferrer nofollow"
                    >
                      https://chrisproject.org/docs/public_dataset_viewer
                    </a>
                    .
                  </p>
                </Typography>
              }
            />
            {/* RIGHT side of header bar */}
            <HeaderOptionBar options={nvOptions} setOptions={setNvOptions} />
          </div>
        </div>
      </PageSection>

      {
        /*
         * An effortless and ugly display of any warnings and error messages
         * which may have come up.
         */
        problems.length === 0 || (
          <PageSection>
            {problems.map(({ variant, title, body }, i) => (
              <Alert variant={variant} title={title} key={i}>
                {body}
              </Alert>
            ))}
          </PageSection>
        )
      }

      <PageSection isFilled>
        <div style={{ backgroundColor: "darkgreen", height: "100%" }}>
          NIIVUE CANVAS GOES HERE
        </div>
        {/*<SizedNiivueCanvas*/}
        {/*  size={nvSize}*/}
        {/*  isScaling={sizeIsScaling}*/}
        {/*  onLocationChange={setCrosshairLocation}*/}
        {/*  options={nvOptions}*/}
        {/*  volumes={(files || []).map((file) => file.currentSettings)}*/}
        {/*/>*/}
      </PageSection>
      <PageSection isFilled={false}>
        <footer>
          <div className={css(styles.crosshairLocationText, hideOnMobile)}>
            Location: {crosshairLocation.string}
          </div>
          <div className={flexRowSpaceBetween}>
            {/* LEFT FOOTER */}
            <div className={styles.footerItems}>
              <div>&copy;&nbsp;2024</div>
              <div>
                <a href="https://www.fnndsc.org/" target="_blank">
                  <span className={hideOnMobile}>
                    Fetal-Neonatal Neuroimaging Developmental Science Center
                  </span>
                  <span className={hideOnDesktop}>FNNDSC</span>
                </a>
              </div>
            </div>
            {/* RIGHT FOOTER */}
            <div className={styles.footerItems}>
              <div>
                <em>ChRIS_ui</em>{" "}
                <span className={hideOnMobileInline}>
                  version {BUILD_VERSION}
                </span>
              </div>
              <Popover
                triggerAction="hover"
                showClose={true}
                headerContent={
                  <div>We appreciate any comments and suggestions!</div>
                }
                bodyContent={
                  <div>
                    Email <a href="mailto:dev@babyMRI.org">dev@babyMRI.org</a>{" "}
                    or create an issue on{" "}
                    <a href="https://github.com/FNNDSC/ChRIS_ui">GitHub</a>.
                  </div>
                }
              >
                <Chip isReadOnly={true} component="button">
                  <b>Feedback</b>
                </Chip>
              </Popover>
            </div>
          </div>
        </footer>
      </PageSection>
    </WrapperConnect>
  );
};

export default VisualDatasets;
