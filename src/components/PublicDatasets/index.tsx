import React, { useEffect, useState } from "react";
import { DraftFunction, useImmer } from "use-immer";
import { useDispatch } from "react-redux";
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button, Chip,
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
  Progress,
  ProgressVariant
} from "@patternfly/react-core";
import { BrainIcon, DesktopIcon } from "@patternfly/react-icons";
import { Typography } from "antd";
import { Feed, FeedFile } from "@fnndsc/chrisapi";
import { NiivueCanvas } from "niivue-react/src/index";

import WrapperConnect from "../Wrapper";
import { InfoIcon } from "../Common";
import ChrisAPIClient from "../../api/chrisapiclient";
import { setIsNavOpen, setSidebarActive } from "../../store/ui/actions.ts";

import { groupBySubject, PublicDatasetFile, Subject } from "./subjects";
import styles from "./styles.module.css";
import {VolumeEntry, ChNVROptions} from "./models.ts";
import { files2volumes } from "./options.tsx";
import { fileResourceUrlOf, hideColorBarofInvisibleVolume, nullUpdaterGuard } from "./helpers.ts";
import NiivueOptionsPanel from "./NiivueOptionsPanel.tsx";
import SelectedFilesOptionsPane from "./SelectedFilesOptionsPane.tsx";
import { DEFAULT_OPTIONS } from "./defaults.ts";
import preval from "preval.macro";
import HeaderOptionBar from "./HeaderOptionBar.tsx";

const MAGIC_PUBLIC_DATASET_FILENAME = '.is.chris.publicdataset';

type Problem = {
  variant: "warning" | "success" | "danger" | "info"
  title: string,
  body?: React.ReactNode
};

type Files = {
  totalCount: number,
  items: PublicDatasetFile[]
}

type SelectedSubject = {
  subject: Subject,
  volumes: VolumeEntry[]
}

/**
 * Type emitted by Niivue.onLocationChange
 *
 * https://github.com/niivue/niivue/issues/860
 */
type CrosshairLocation = {
  string: string;
}

const PublicDatasets: React.FunctionComponent = () => {

  const client = ChrisAPIClient.getClient();
  const dispatch = useDispatch();
  const [feeds, setFeeds] = useState<Feed[] | null>(null);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [feedFiles, setFeedFiles] = useState<Files | null>(null);
  const [giveupPagingFiles, setGiveupPagingFiles] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selected, setSelected] = useImmer<SelectedSubject | null>(null);

  const [nvOptions, setNvOptions] = useImmer<ChNVROptions>(DEFAULT_OPTIONS);

  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [crosshairLocation, setCrosshairLocation] = useState<CrosshairLocation>({string: ""});

  const buildVersion: string = preval`
    const { execSync } = require('child_process')
    module.exports = execSync('npm run -s print-version', {encoding: 'utf-8'})
  `;

  const subjects = feedFiles ? groupBySubject(feedFiles.items, MAGIC_PUBLIC_DATASET_FILENAME) : [];
  const volumes = selected?.volumes.map((v) => v.volume).map(hideColorBarofInvisibleVolume) || [];
  const setSelectedVolumes = (update: DraftFunction<VolumeEntry[]>) => {
    nullUpdaterGuard(setSelected)((draft) => update(draft.volumes));
  };

  // HELPER FUNCTIONS
  // --------------------------------------------------------------------------------

  const pushProblem = (problem: Problem) => setProblems(problems.concat([problem]));

  const pushProblemOnce = (problem: Problem) => {
    if (problems.findIndex((other) => other.title === problem.title) === -1) {
      pushProblem(problem);
    }
  };

  const fetchFeedsContainingPublicDatasets = async () => {
    const searchParams = {
      files_fname_icontains: MAGIC_PUBLIC_DATASET_FILENAME,
      limit: 10
    };

    try {
      const feedsCollection = await client.getPublicFeeds(searchParams);

      if (feedsCollection.totalCount > 10) {
        pushProblemOnce({
          variant: 'warning',
          title: 'More than 10 feeds found.',
          body: 'Since pagination is not implemented yet, not all of them are shown.'
        });
      }

      // @ts-ignore
      setFeeds(feedsCollection.getItems());
    } catch (e) {
      pushProblem({
        variant: "danger",
        title: 'Could not load feeds.'
      });
      throw e;
    }
  };

  const fetchMoreFileUrlsIfNeeded = async (feed: Feed) => {
    if (feedFiles && feedFiles.items.length >= feedFiles.totalCount) {
      return;
    }

    try {
      setFeedFiles(await fetchNextFilesState(feed));
    } catch (e) {
      pushProblemOnce({
        variant: "danger",
        title: "Could not get file URLs",
        body: <pre>{e && typeof e === 'object' ? e.toString() : "unknown error"}</pre>
      })
      setGiveupPagingFiles(true);
      throw e;
    }
  };

  const fetchNextFilesState = async (feed: Feed): Promise<Files> => {
    const offset = feedFiles ? feedFiles.items.length : 0;
    const collection = await feed.getFiles({limit: 10, offset });
    const collectionItems = collection.getItems();

    if (collectionItems === null) {
      throw new Error(`could not get files of feed id=${feed.data.id}: collection.getItems() -> null`);
    }

    const newItems: PublicDatasetFile[] = collectionItems.map((feedFile: FeedFile) => {
      return {
        ...feedFile.data,
        file_resource: fileResourceUrlOf(feedFile)
      }
    });
    const items = feedFiles ? feedFiles.items.concat(newItems) : newItems;
    const totalCount = collection.totalCount;
    return { totalCount, items };
  };

  const onSubjectDropdownSelect = (_e: any, value: string | number | undefined) => {
    const selectedSubject = subjects.find((subject) => subject.name === value);
    if (selectedSubject === undefined) {
      console.warn(`No subject found with name "${value}". THIS IS A BUG.`);
      return;
    }
    setSubject(selectedSubject);
    setIsSubjectDropdownOpen(false);
  };

  const setSubject = (subject: Subject) => {
    setSelected({subject, volumes: files2volumes(subject.files)});
  };

  // EFFECTS
  // --------------------------------------------------------------------------------

  React.useEffect(() => {
    document.title = "Fetal MRI Viewer";
    dispatch(setIsNavOpen(false));
    dispatch(
      setSidebarActive({
        activeItem: "niivue",
      })
    );
  }, [dispatch]);

  // on first load, get all the public feeds containing public datasets.
  useEffect(() => {
    fetchFeedsContainingPublicDatasets();
  }, []);

  // once feeds have been found, automatically select the first feed.
  useEffect(() => {
    if (feeds === null) {
      return;
    }
    if (feed === null) {
      if (feeds.length === 0) {
        pushProblemOnce({
          variant: "warning",
          title: 'No public datasets found.',
          body: (<span>
            To add a public dataset, follow these instructions:{' '}
            <a href="https://chrisproject.org/docs/public_dataset_browser" target="_blank">
              https://chrisproject.org/docs/public_dataset_browser
            </a>
          </span>)
        });
      } else {
        setFeed(feeds[0]);
        if (feeds.length > 1) {
          pushProblemOnce({
            variant: "warning",
            title: "Multiple feeds found",
            body: (<>
              <p>Found public datasets in the following feeds:</p>
              <pre>{JSON.stringify(feeds.map((feed) => feed.data.name))}</pre>
              <p>Currently it is not possible to show any other feed besides the first.</p>
            </>)
          });
        }
      }
    }
  }, [feeds]);

  // once a feed has been set, get all of its files.
  useEffect(() => {
    if (feed === null) {
      return;
    }
    fetchMoreFileUrlsIfNeeded(feed);
  }, [feed, feedFiles]);

  // if subjects are found and no subject has been selected yet, set the first subject as selected.
  useEffect(() => {
    if (selected === null && subjects.length > 0) {
      setSubject(subjects[0]);
    }
  }, [subjects]);

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
                  Datasets found in public feeds can be visualized here using{' '}
                  <a href="https://github.com/niivue/niivue" target="_blank" rel="noreferrer nofollow">Niivue</a>.
                </p>
                <p>
                  For how to add data here, see the documentation:
                  <a href="https://chrisproject.org/docs/public_dataset_viewer" target="_blank" rel="noreferrer nofollow">
                    https://chrisproject.org/docs/public_dataset_viewer
                  </a>.
                </p>
              </Typography>
            }
          />
          {/* RIGHT side of header bar */}
          <HeaderOptionBar options={nvOptions} setOptions={setNvOptions} />
        </div>
      </PageSection>

      {
        problems.length === 0 || (
          <PageSection>
            {
              problems.map(({ variant, title, body }) => (
                <Alert variant={variant} title={title} key={title}>{body}</Alert>
              ))
            }
          </PageSection>
        )
      }

      <PageGroup>
        <PageNavigation>
          <PageBreadcrumb>
            <Breadcrumb>
              <BreadcrumbItem>
                <Popover
                  bodyContent={<NiivueOptionsPanel options={nvOptions} setOptions={setNvOptions} />}
                  minWidth="20rem"
                  maxWidth="40rem"
                >
                  <Button variant="tertiary">
                    <DesktopIcon /> Viewer
                  </Button>
                </Popover>

              </BreadcrumbItem>
              { feed && <BreadcrumbItem>{feed.data.name}</BreadcrumbItem>}
              { subjects && selected &&
                <BreadcrumbItem>
                  <Dropdown
                    isOpen={isSubjectDropdownOpen}
                    onSelect={onSubjectDropdownSelect}
                    onOpenChange={(isOpen: boolean) => setIsSubjectDropdownOpen(isOpen)}

                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle ref={toggleRef} onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)} isExpanded={isSubjectDropdownOpen}>
                        {selected?.subject.name}
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList>
                      {
                        subjects
                          .map((subject) => subject.name)
                          .sort()
                          .map((name) => <DropdownItem key={name} value={name}>{name}</DropdownItem>)
                      }
                    </DropdownList>
                  </Dropdown>
                </BreadcrumbItem>
              }
              { subjects && selected &&
                <BreadcrumbItem>
                  <Popover
                    bodyContent={<SelectedFilesOptionsPane volumes={selected.volumes} setVolumes={setSelectedVolumes}/>}
                    minWidth="20rem"
                    maxWidth="40rem"
                  >
                    <Button variant="tertiary">
                      <BrainIcon /> Options
                    </Button>
                  </Popover>
                </BreadcrumbItem>
              }
            </Breadcrumb>
          </PageBreadcrumb>
        </PageNavigation>
      </PageGroup>

      {
        // show progress bar of feed files pagination while loading
        feedFiles && feedFiles.items.length !== feedFiles.totalCount &&
        <PageSection>
          <Progress
            value={feedFiles.items.length}
            min={0}
            max={feedFiles.totalCount}
            variant={giveupPagingFiles ? ProgressVariant.danger : undefined}
          />
        </PageSection>
      }
      <PageSection isFilled>
        <div className={styles.niivueContainer}>
          <NiivueCanvas
            options={nvOptions}
            volumes={volumes}
            onStart={(nv) => {
              nv.onLocationChange = (location) => setCrosshairLocation(location as CrosshairLocation);
            }}
          />
        </div>
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
              <div>
                &copy;&nbsp;2024
              </div>
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
                headerContent={<div>We appreciate any comments and suggestions!</div>}
                bodyContent={<div>
                  Email{" "}
                  <a href="mailto:dev@babyMRI.org">dev@babyMRI.org</a>{" "}
                  or create an issue on{" "}
                  <a href="https://github.com/FNNDSC/ChRIS_ui">
                    GitHub
                  </a>.
                </div>}
              >
                <Chip isReadOnly={true} component="button"><b>Feedback</b></Chip>
              </Popover>
            </div>
          </div>
        </footer>
      </PageSection>
    </WrapperConnect>
  );
}

export default PublicDatasets;
