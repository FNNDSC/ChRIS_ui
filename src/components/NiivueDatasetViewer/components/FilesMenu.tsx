import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemAction,
  MenuGroup,
  MenuList,
  LabelGroup,
  Label,
  Spinner,
  Tabs,
  Tab,
  HelperText,
  HelperTextItem,
  Panel,
  PanelMain,
  PanelMainBody,
  TabTitleText,
  TabTitleIcon,
  List,
  ListItem,
  HintTitle,
  HintBody,
  Hint,
} from "@patternfly/react-core";
import {
  PlusIcon,
  PlusCircleIcon,
  FolderOpenIcon,
  FolderCloseIcon,
  BrainIcon,
} from "@patternfly/react-icons";
import { TagSet } from "../client/models";
import React from "react";
import { DatasetFileState, volumeIsLoaded } from "../statefulTypes";
import { ChNVRVolume } from "../models";
import VolumeOptionsForm from "./VolumeOptionsForm";
import BackgroundColor from "@patternfly/react-styles/css/utilities/BackgroundColor/BackgroundColor";
import Sizing from "@patternfly/react-styles/css/utilities/Sizing/sizing";
import { css } from "@patternfly/react-styles";
import tabStyle from "./pfTabHeight.module.css";

type FilesMenuProps = {
  fileStates: ReadonlyArray<DatasetFileState>;
  setFileStates: React.Dispatch<
    React.SetStateAction<ReadonlyArray<DatasetFileState>>
  >;
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
const FilesMenu: React.FC<FilesMenuProps> = ({ fileStates, setFileStates }) => {
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

  const tagSetToLabelGroup = (tags: TagSet): React.ReactNode => {
    return (
      <LabelGroup numLabels={8}>
        {Object.entries(tags).map(([key, value]) => (
          <Label isCompact key={JSON.stringify([key, value])}>
            {key}: {value}
          </Label>
        ))}
      </LabelGroup>
    );
  };

  const selectionMenu = (
    <Menu onSelect={onMenuSelect} onActionClick={onActionClick}>
      <MenuContent>
        <MenuGroup>
          <MenuList>
            {fileStates.map(({ file, volume }) => {
              return (
                <MenuItem
                  key={file.path}
                  description={tagSetToLabelGroup(file.tags)}
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
                >
                  {file.path}
                </MenuItem>
              );
            })}
          </MenuList>
        </MenuGroup>
      </MenuContent>
    </Menu>
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

  // TODO add functionality for reordering volumes.

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
    "File Selection",
  );

  const tabs: {
    title: string;
    icon: React.ReactNode;
    body: React.ReactNode;
  }[] = [
    {
      title: "File Selection",
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
      title: "Volume Options",
      icon: <BrainIcon />,
      body:
        loadedVolumes.length === 0 ? noVolumesSelectedHint : volumeOptionsMenu,
    },
  ];

  return (
    <Tabs
      isFilled
      activeKey={activeTabKey}
      onSelect={(_e, t) => setActiveTabKey(t)}
    >
      {tabs.map(({ title, icon, body }) => (
        <Tab
          key={title}
          eventKey={title}
          title={
            <>
              <TabTitleIcon>{icon}</TabTitleIcon>{" "}
              <TabTitleText>{title}</TabTitleText>
            </>
          }
          className={tabStyle.tab}
        >
          <div
            className={css(
              tabStyle.tabBody,
              BackgroundColor.backgroundColor_200,
            )}
          >
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

export default FilesMenu;
