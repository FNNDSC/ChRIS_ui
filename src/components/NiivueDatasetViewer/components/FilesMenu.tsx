import {
  HelperText,
  HelperTextItem,
  Hint,
  HintBody,
  HintTitle,
  Label,
  LabelGroup,
  List,
  ListItem,
  Menu,
  MenuContent,
  MenuItem,
  MenuItemAction,
  MenuList,
  Panel,
  PanelMain,
  PanelMainBody,
  SearchInput,
  Spinner,
  Tab,
  Tabs,
  TabTitleIcon,
  TabTitleText,
} from "@patternfly/react-core";
import {
  BrainIcon,
  DesktopIcon,
  FolderCloseIcon,
  FolderOpenIcon,
  PlusCircleIcon,
  PlusIcon,
} from "@patternfly/react-icons";
import { css } from "@patternfly/react-styles";
import Spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
import React from "react";
import type { TagSet } from "../client/models";
import type { ChNVRVolume } from "../models";
import { type DatasetFileState, volumeIsLoaded } from "../statefulTypes";
import type { TagsDictionary } from "../types";
import styles from "./FilesMenu.module.css";
import tabStyle from "./pfTabHeight.module.css";
import SettingsTab, { type SettingsTabProps } from "./SettingsTab.tsx";
import TagColors from "./TagColors";
import VolumeOptionsForm from "./VolumeOptionsForm";

type FilesMenuProps = SettingsTabProps & {
  fileStates: ReadonlyArray<DatasetFileState>;
  setFileStates: React.Dispatch<
    React.SetStateAction<ReadonlyArray<DatasetFileState>>
  >;
  tagsDictionary: TagsDictionary;
};

// It would be nice to use DragDropSort from @patternfly/react-drag-drop
// to let the user reorder the volumes, however currently there is a bug:
// https://github.com/patternfly/patternfly-react/issues/10090

const FileSelectHelpText = () => {
  return (
    <Panel>
      <PanelMain>
        <PanelMainBody>
          <HelperText>
            <HelperTextItem variant="indeterminate">
              Click to display volume.
            </HelperTextItem>
            <HelperTextItem variant="indeterminate">
              {isTouchDevice() ? (
                <>
                  Tap the <PlusIcon /> icon
                </>
              ) : (
                <>
                  <kbd>CTRL</kbd>/&#8984;-click
                </>
              )}{" "}
              to add the volume as an overlay.
            </HelperTextItem>
          </HelperText>
        </PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

/**
 * A container for vertical scrolling.
 */
const ScrollContainer: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => (
  <div
    style={{
      position: "relative",
      overflowY: "scroll",
      height: "100%",
      width: "100%",
    }}
  >
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%" }}>
      {children}
    </div>
  </div>
);

const TagSetLabelGroup: React.FC<{
  tags: TagSet;
  onClick: (k: string, v: string) => void;
  numLabels: number;
  tagColors: TagColors;
}> = ({ tags, onClick, numLabels, tagColors }) => (
  <LabelGroup numLabels={numLabels}>
    {Object.entries(tags).map(([key, value]) => (
      <Label
        key={JSON.stringify([key, value])}
        color={tagColors.getColor(key, value)}
        onClick={() => onClick(key, value)}
        isCompact
      >
        {key}: {value}
      </Label>
    ))}
  </LabelGroup>
);

/**
 * The `FilesMenu` component displays a list of all the files of a dataset.
 * It also controls the properties for each volume currently being displayed.
 *
 * @param fileStates the files of the dataset and their current state,
 *                   which includes whether they are currently being displayed
 *                   and what settings they are displayed with.
 * @param setFileStates update the file states
 * @param pushProblems notify parent component of any problems
 */
const FilesMenu: React.FC<FilesMenuProps> = ({
  fileStates,
  setFileStates,
  tagsDictionary,
  ...settingsTabProps
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const [filterTags, setFilterTags] = React.useState<
    ReadonlyArray<[string, string]>
  >([]);

  /**
   * Unload all currently displayed volumes, then load the selected file.
   */
  const selectOnlyItem = (path: string) => {
    setFileStates((prev) =>
      prev.map((fileState) => {
        const { volume, file } = fileState;
        // unload all others
        if (path !== file.path) {
          return { file, volume: null };
        }
        // do nothing if already loading or loaded
        if (volume !== null) {
          return fileState;
        }
        // kindly ask parent element to load volume
        return { file, volume: "pleaseLoadMe" };
      }),
    );
  };

  /**
   * Load the selected file (without unloading others).
   */
  const addItemToSelection = (path: string) => {
    return setFileStates((prev) =>
      prev.map((fileState) => {
        if (fileState.file.path === path && fileState.volume === null) {
          return { ...fileState, volume: "pleaseLoadMe" };
        }
        return fileState;
      }),
    );
  };

  const onMenuSelect = (
    event: React.MouseEvent<Element, MouseEvent> | undefined,
    itemId: number | string | undefined,
  ) => {
    if (typeof itemId !== "string") {
      throw new Error(
        `FileMenuList not a non-string itemId: ${itemId} (type is ${typeof itemId})`,
      );
    }
    if (event === undefined) {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      addItemToSelection(itemId);
    } else {
      selectOnlyItem(itemId);
    }
  };

  const onActionClick = (
    _event: React.MouseEvent<Element, MouseEvent>,
    itemId: string,
    actionId: string,
  ) => {
    if (actionId !== "display") {
      throw new Error(`unknown action "${actionId}" for item ${itemId}`);
    }
    addItemToSelection(itemId);
  };

  const tagColors = React.useMemo(
    () => new TagColors(tagsDictionary),
    [tagsDictionary],
  );

  /**
   * Add a tag to the set of tag filters.
   */
  const pushTagFilter = (key: string, value: string) => {
    setFilterTags((prev) =>
      prev.findIndex(([k, v]) => k === key && v === value) === -1
        ? prev.concat([[key, value]])
        : prev,
    );
  };

  /**
   * Remove a tag from the set of tag filters.
   */
  const removeTagFilter = (key: string, value: string) => {
    setFilterTags((prev) => prev.filter(([k, v]) => k !== key && v !== value));
  };

  /**
   * Files should be filtered if:
   *
   * - search input is a substring of file's path
   * - search input is a substring of any of the file's tag values
   */
  const filteredFileStates = React.useMemo(
    () =>
      fileStates.filter(({ file }) => {
        if (filterTags.length > 0) {
          for (const [key, value] of filterTags) {
            if (file.tags[key] !== value) {
              return false;
            }
          }
        }

        const searchLowerCase = searchValue.toLowerCase();
        if (file.path.toLowerCase().includes(searchLowerCase)) {
          return true;
        }
        for (const value of Object.values(file.tags)) {
          if (value.toLowerCase().includes(searchLowerCase)) {
            return true;
          }
        }
        return false;
      }),
    [fileStates, searchValue, filterTags],
  );

  const menuItems = filteredFileStates.map((fileState) => {
    const { file, volume } = fileState;
    const style = volumeIsLoaded(fileState)
      ? [styles.fileMenuItem, styles.selected]
      : [styles.fileMenuItem];
    const tagsElement = (
      <TagSetLabelGroup
        tags={file.tags}
        tagColors={tagColors}
        numLabels={8}
        onClick={pushTagFilter}
      />
    );

    return (
      <MenuItem
        key={file.path}
        description={tagsElement}
        itemId={file.path}
        actions={
          <>
            <MenuItemAction
              actionId="display"
              icon={iconFor(volume)}
              aria-label="display"
            />
          </>
        }
        className={css(...style)}
      >
        {file.path}
      </MenuItem>
    );
  });

  const selectionMenu = (
    <>
      <SearchInput
        placeholder="Filter"
        value={searchValue}
        onChange={(_e, v) => setSearchValue(v)}
        onClear={() => setSearchValue("")}
        resultsCount={filteredFileStates.length}
      />
      {filterTags.length > 0 && (
        <div className={css(Spacing.pSm)}>
          <small style={{ color: "var(--pf-v5-global--Color--100)" }}>
            Filters:&nbsp;&nbsp;
          </small>
          <TagSetLabelGroup
            tags={Object.fromEntries(filterTags)}
            tagColors={tagColors}
            numLabels={100}
            onClick={removeTagFilter}
          />
        </div>
      )}
      <Menu onSelect={onMenuSelect} onActionClick={onActionClick}>
        <MenuContent>
          <MenuList>{menuItems}</MenuList>
        </MenuContent>
      </Menu>
    </>
  );

  const loadedVolumes = fileStates.filter(volumeIsLoaded).map((fileState) => {
    return { path: fileState.file.path, ...fileState.volume };
  });

  const noVolumesSelectedHint = (
    <Hint>
      <HintTitle>No files selected.</HintTitle>
      <HintBody>
        Go back to the "File Selection" tab and click on a file, then come back
        here to edit the file's options.
      </HintBody>
    </Hint>
  );

  /**
   * Curried function for changing the state of a loaded volume.
   */
  const changeLoadedStateOf = (
    path: string,
  ): ((nextState: ChNVRVolume) => void) => {
    return (nextState) => {
      setFileStates((prev) =>
        prev.map((fileState) => {
          if (fileState.file.path !== path) {
            return fileState;
          }
          if (!volumeIsLoaded(fileState)) {
            throw new Error(
              `Cannot change state of volume "${path}", it is not yet loaded.`,
            );
          }
          return {
            ...fileState,
            volume: { ...fileState.volume, state: nextState },
          };
        }),
      );
    };
  };

  const volumeOptionsMenu = (
    <List isPlain isBordered>
      {loadedVolumes.map(({ path, state, default: defaultOptions }) => (
        <ListItem key={path}>
          <VolumeOptionsForm
            name={path}
            state={state}
            defaultOptions={defaultOptions}
            onChange={changeLoadedStateOf(path)}
          />
        </ListItem>
      ))}
    </List>
  );

  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(
    "files",
  );

  const tabs: {
    key: string;
    title: string;
    longTitle: string;
    icon: React.ReactNode;
    body: React.ReactNode;
  }[] = [
    {
      key: "files",
      title: "Files",
      longTitle: "Files Selection",
      icon:
        activeTabKey === "File Selection" ? (
          <FolderOpenIcon />
        ) : (
          <FolderCloseIcon />
        ),
      body: (
        <>
          <FileSelectHelpText />
          {selectionMenu}
        </>
      ),
    },
    {
      key: "volumes",
      title: "Volumes",
      longTitle: "Volume Options",
      icon: <BrainIcon />,
      body:
        loadedVolumes.length === 0 ? noVolumesSelectedHint : volumeOptionsMenu,
    },
    {
      key: "settings",
      title: "Settings",
      longTitle: "Viewer Settings",
      icon: <DesktopIcon />,
      body: <SettingsTab {...settingsTabProps} />,
    },
  ];

  return (
    <Tabs
      isFilled
      activeKey={activeTabKey}
      onSelect={(_e, t) => setActiveTabKey(t)}
    >
      {tabs.map(({ key, title, longTitle, icon, body }) => (
        <Tab
          key={key}
          eventKey={key}
          title={
            <>
              <TabTitleIcon>{icon}</TabTitleIcon>{" "}
              <TabTitleText>
                {activeTabKey === key ? longTitle : title}
              </TabTitleText>
            </>
          }
          className={tabStyle.tab}
        >
          <div className={tabStyle.tabBody}>
            <ScrollContainer>{body}</ScrollContainer>
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

function iconFor<T>(
  volume: null | "loading" | "pleaseLoadMe" | T,
): React.ReactNode {
  if (volume === null) {
    return <PlusIcon />;
  }
  if (volume === "loading" || volume === "pleaseLoadMe") {
    return <Spinner isInline />;
  }
  return <PlusCircleIcon />;
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export type { FilesMenuProps };
export default FilesMenu;
