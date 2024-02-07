import React, { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { useDispatch } from "react-redux";
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  PageBreadcrumb,
  PageGroup,
  PageNavigation,
  PageSection,
  Popover,
} from "@patternfly/react-core";
import { BrainIcon, DesktopIcon } from "@patternfly/react-icons";
import { Typography } from "antd";

import WrapperConnect from "../Wrapper";
import { InfoIcon } from "../Common";
import ChrisAPIClient from "../../api/chrisapiclient";
import { setIsNavOpen, setSidebarActive } from "../../store/ui/actions.ts";

import styles from "./styles.module.css";
import { ChNVROptions, VisualDatasetFile } from "./models.ts";
import NiivueOptionsPanel from "./components/NiivueOptionsPanel.tsx";
import SelectedFilesOptionsPane from "./components/SelectedFilesOptionsPane.tsx";
import { DEFAULT_OPTIONS } from "./defaults.ts";
import preval from "preval.macro";
import HeaderOptionBar from "./components/HeaderOptionBar.tsx";
import FeedButton from "./components/FeedButton.tsx";
import {
  CrosshairLocation,
  SizedNiivueCanvas,
} from "./components/SizedNiivueCanvas.tsx";
import { Problem, VisualDataset } from "./types.ts";
import VisualDatasetsClient from "./client.tsx";
import ProblemsManager from "./problems.ts";
import { nullUpdaterGuard } from "./helpers.ts";

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
  const client = ChrisAPIClient.getClient();
  const dispatch = useDispatch();

  const [datasets, setDatasets] = useState<VisualDataset[] | null>(null);
  const [dataset, setDataset] = useState<VisualDataset | null>(null);
  const { feed, plugininstance } = dataset || {
    feed: null,
    plugininstance: null,
  };
  const [subjectNames, setSubjectNames] = useState<string[] | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(
    null,
  );
  const [files, setFiles] = useImmer<VisualDatasetFile[] | null>(null);

  const [nvOptions, setNvOptions] = useImmer<ChNVROptions>(DEFAULT_OPTIONS);
  const [nvSize, setNvSize] = useState(10);
  const [sizeIsScaling, setSizeIsScaling] = useState(false);

  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [crosshairLocation, setCrosshairLocation] = useState<CrosshairLocation>(
    { string: "" },
  );

  const buildVersion: string = preval`
    const { execSync } = require('child_process')
    module.exports = execSync('npm run -s print-version', {encoding: 'utf-8'})
  `;

  const problemsManger = new ProblemsManager(useState<Problem[]>([]));
  const visualDatasetsClient = new VisualDatasetsClient(client, problemsManger);

  const onSubjectDropdownSelect = (
    _e: any,
    value: string | number | undefined,
  ) => {
    setIsSubjectDropdownOpen(false);
    setSelectedSubjectName(value as string);
  };

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
    visualDatasetsClient.getVisualDatasetFeeds().then((datasets) => {
      setDatasets(datasets);
    });
  }, []);

  // once datasets have been found, automatically select the first dataset.
  useEffect(() => {
    if (datasets === null) {
      setDataset(null);
      return;
    }
    if (feed === null) {
      setDataset(visualDatasetsClient.getOneDatasetFrom(datasets));
    }
  }, [datasets]);

  // when a dataset is selected, get the subjects of the dataset
  useEffect(() => {
    if (plugininstance === null) {
      setSubjectNames(null);
      return;
    }
    visualDatasetsClient.listSubjects(plugininstance).then(setSubjectNames);
  }, [plugininstance]);

  // when subjects become known, select a subject to display.
  useEffect(() => {
    if (subjectNames === null) {
      setSelectedSubjectName(null);
      return;
    }
    // by default, select the last subject. For the fetal MRI atlases,
    // the last subject is probably the oldest one, which has the most
    // gyrification and looks the most similar to an adult brain.
    setSelectedSubjectName(subjectNames[subjectNames.length - 1]);
  }, [subjectNames]);

  // whenever the selected subject is changed:
  // 1. unload the previous subject's files.
  // 2. load the current subject's files.
  useEffect(() => {
    setFiles(null);
    if (selectedSubjectName === null) {
      return;
    }
    if (plugininstance === null) {
      throw new Error(
        "Impossible for subject to be selected before plugin instance is known.",
      );
    }
    visualDatasetsClient
      .getFiles(plugininstance, selectedSubjectName)
      .then(setFiles);
  }, [selectedSubjectName]);

  // ELEMENT
  // --------------------------------------------------------------------------------

  return (
    <WrapperConnect>
      <PageSection>
        <div className={styles.leftAndRightContainer}>
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
      </PageSection>

      {
        /*
         * An effortless and ugly display of any warnings and error messages
         * which may have come up.
         */
        problemsManger.problems.length === 0 || (
          <PageSection>
            {problemsManger.problems.map(({ variant, title, body }) => (
              <Alert variant={variant} title={title} key={title}>
                {body}
              </Alert>
            ))}
          </PageSection>
        )
      }

      <PageGroup>
        <PageNavigation>
          <PageBreadcrumb>
            <Breadcrumb>
              <BreadcrumbItem>
                <Popover
                  bodyContent={
                    <NiivueOptionsPanel
                      options={nvOptions}
                      setOptions={setNvOptions}
                      size={nvSize}
                      setSize={setNvSize}
                      sizeIsScaling={sizeIsScaling}
                      setSizeIsScaling={setSizeIsScaling}
                    />
                  }
                  minWidth="20rem"
                  maxWidth="40rem"
                >
                  <Button variant="tertiary">
                    <DesktopIcon /> Viewer
                  </Button>
                </Popover>

                {/* feed selector */}
              </BreadcrumbItem>
              {feed && (
                <BreadcrumbItem>
                  {feed.data.name}
                  <FeedButton feedId={feed.data.id} />
                </BreadcrumbItem>
              )}

              {/* subject selector */}
              <BreadcrumbItem>
                <Dropdown
                  isOpen={isSubjectDropdownOpen}
                  onSelect={onSubjectDropdownSelect}
                  onOpenChange={(isOpen: boolean) =>
                    setIsSubjectDropdownOpen(isOpen)
                  }
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() =>
                        setIsSubjectDropdownOpen(!isSubjectDropdownOpen)
                      }
                      isExpanded={isSubjectDropdownOpen}
                      isDisabled={
                        // subject selection menu disabled when list of subjects not yet loaded
                        subjectNames === null
                      }
                    >
                      {selectedSubjectName || ""}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <DropdownList>
                    {(subjectNames || []).map((name) => (
                      <DropdownItem key={name} value={name}>
                        {name}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
              </BreadcrumbItem>

              {files && (
                <BreadcrumbItem>
                  <Popover
                    bodyContent={
                      <SelectedFilesOptionsPane
                        files={files}
                        setFiles={nullUpdaterGuard(setFiles)}
                      />
                    }
                    minWidth="20rem"
                    maxWidth="40rem"
                  >
                    <Button variant="tertiary">
                      <BrainIcon /> Options
                    </Button>
                  </Popover>
                </BreadcrumbItem>
              )}
            </Breadcrumb>
          </PageBreadcrumb>
        </PageNavigation>
      </PageGroup>
      <PageSection isFilled>
        <SizedNiivueCanvas
          size={nvSize}
          isScaling={sizeIsScaling}
          onLocationChange={setCrosshairLocation}
          options={nvOptions}
          volumes={(files || []).map((file) => file.currentSettings)}
        />
      </PageSection>
      <PageSection>
        <footer>
          <div className={styles.leftAndRightContainer}>
            {/* LEFT FOOTER */}
            <div className={styles.crosshairLocationText}>
              Location: {crosshairLocation.string}
            </div>
          </div>
          <div className={styles.leftAndRightContainer}>
            {/* LEFT FOOTER */}
            <div className={styles.footerItems}>
              <div>&copy;&nbsp;2024</div>
              <div>
                <a href="https://www.fnndsc.org/" target="_blank">
                  Fetal-Neonatal Neuroimaging Developmental Science Center
                </a>
              </div>
            </div>
            {/* RIGHT FOOTER */}
            <div className={styles.footerItems}>
              <div>
                <em>ChRIS_ui</em>
                <span className={styles.hideOnMobile}>
                  version {buildVersion}
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
