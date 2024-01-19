import WrapperConnect from "../Wrapper";
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button, Checkbox,
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
  ProgressVariant,
  Slider,
  Text,
  TextContent,
  TextVariants
} from "@patternfly/react-core";
import { DesktopIcon, BrainIcon } from "@patternfly/react-icons";
import { InfoIcon } from "../Common";
import { Typography } from "antd";
import React, { useEffect, useState } from "react";
import { Feed, FeedFile } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient.ts";
import { groupBySubject, PublicDatasetFile, Subject } from "./subjects.ts";
import { NiivueCanvas, NVROptions } from "niivue-react/src/index";
import { Niivue, NVImage, SLICE_TYPE } from "@niivue/niivue";
import { useImmer } from "use-immer";
import styles from "./styles.module.css";
import { setSidebarActive } from "../../store/ui/actions.ts";
import { useDispatch } from "react-redux";
import { CVDVolume, files2volumes, VolumeOptions } from "./options.tsx";
import { fileResourceUrlOf, hideColorBarofInvisibleVolume } from "./helpers.ts";

const MAGIC_PUBLIC_DATASET_FILENAME = '.is.chris.publicdataset';

const _NIIVUE = new Niivue();
const NIIVUE_COLORMAPS = _NIIVUE.colormaps();


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
  volumes: VolumeOptions[]
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

  const [nvOptions, setNvOptions] = useImmer<NVROptions>({
    isColorbar: true,
    isOrientCube: true,
    isHighResolutionCapable: true,
    sliceType: SLICE_TYPE.MULTIPLANAR,
    isSliceMM: true,
    backColor: [0, 0, 0],
    multiplanarForceRender: true,
  });

  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  const subjects = feedFiles ? groupBySubject(feedFiles.items, MAGIC_PUBLIC_DATASET_FILENAME) : [];
  const volumes = selected?.volumes.map((v) => v.volume).map(hideColorBarofInvisibleVolume) || [];

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
    document.title = "Public Datasets Browser";
    dispatch(
      setSidebarActive({
        activeItem: "niivue",
      })
    );
  }, []);

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
        <InfoIcon
          title="Public Datasets"
          p1={
            <Typography>
              <p>
                Datasets found in public feeds can be visualized here using
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
                <DesktopIcon />

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
                    triggerAction="hover"
                    bodyContent={<div>{
                      selected.volumes.map(({ name, volume }, i) => {

                        const setValue = (change: (volume: CVDVolume) => void) => {
                          setSelected((draft) => {
                            if (draft === null) {
                              throw new Error('unreachable code');
                            }
                            change(draft.volumes[i].volume);
                          });
                        };

                        // TODO debounce for performance
                        const setOpacity = (_e: any, value: number) => {
                          setValue((volume) => volume.opacity = value);
                        };

                        const setColorbarvisible = (_e: React.FormEvent<HTMLInputElement>, checked: boolean) => {
                          setValue((volume) => volume.colorbarVisible = checked);
                        };

                        return (<div key={`${name}-options`}>
                          <TextContent>
                            <Text component={TextVariants.h3}>{name}</Text>
                          </TextContent>
                          <Text component={TextVariants.p}>Opacity: {volume.opacity}</Text>
                          <Slider
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={volume.opacity}
                            onChange={setOpacity}
                          />
                          {
                            volume.opacity > 0 &&
                            <>
                              <Checkbox
                                label="Show colormap"
                                isChecked={volume.colorbarVisible}
                                onChange={setColorbarvisible}
                                id={`${name}-colormapvisible-checkbox`}
                              />


                            </>
                          }

                        </div>)
                      })
                    }</div>}
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
            onSync={(nv: Niivue) => {
              // workaround for behavior mismatch between desired behavior of hideColorBarofInvisibleVolume
              // and Niivue colorbarVisible bug https://github.com/niivue/niivue/issues/848
              if (nv.volumes.length !== volumes.length) {
                return;  // not done loading yet
              }
              const wronglyShowingColorbar = volumes
                .filter((v) => !v.colorbarVisible)
                .map((v) => nv.getMediaByUrl(v.url))
                .filter((v): v is NVImage => v !== undefined)
                .filter((v) => v.colorbarVisible);
              if (wronglyShowingColorbar.length > 0) {
                wronglyShowingColorbar.forEach((v) => v.colorbarVisible = false);
                nv.updateGLVolume();
              }
            }}
          />
        </div>
      </PageSection>
    </WrapperConnect>
  );
}

export default PublicDatasets;
