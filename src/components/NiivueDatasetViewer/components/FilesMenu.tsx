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
  Tooltip,
  Tabs,
  Tab,
  HelperText,
  HelperTextItem,
  Panel,
  PanelMain,
  PanelMainBody,
  TabTitleText,
  TabTitleIcon,
} from "@patternfly/react-core";
import {
  PlusIcon,
  PlusCircleIcon,
  FolderOpenIcon,
  FolderCloseIcon,
  BrainIcon,
} from "@patternfly/react-icons";
import { TagSet } from "../client/models.ts";
import React from "react";
import { DatasetFileState, DatasetVolume } from "../statefulTypes";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { Problem } from "../types";
import { ChNVRVolume } from "../models.ts";
import { DatasetFile } from "../client";

type FilesMenuProps = {
  fileStates: ReadonlyArray<DatasetFileState>;
  setFileStates: React.Dispatch<
    React.SetStateAction<ReadonlyArray<DatasetFileState>>
  >;
  pushProblems: (problems: Problem[]) => void;
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
 * The `FilesMenu` component displays a list of all the files of a dataset.
 * It is responsible for getting the URL to the volume data and controlling
 * the properties for each volume currently being displayed.
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
  pushProblems,
}) => {
  const pushProblem = (problem: Problem) => pushProblems([problem]);

  /**
   * Update the state of a file with the given path.
   */
  const updateStateAt = (
    path: string,
    updater: (fileState: DatasetFileState) => DatasetFileState,
  ) => {
    setFileStates((prev) =>
      prev.map((fileState) =>
        fileState.file.path === path ? updater(fileState) : fileState,
      ),
    );
  };

  /**
   * Request the file volume's URL asynchronously.
   */
  const startLoadingVolume = (file: DatasetFile): DatasetFileState => {
    const task = pipe(
      file.getVolume(),
      TE.match(pushProblem, setFreshVolumeOf(file.path)),
    );
    task();
    return { file, volume: "loading" };
  };

  /**
   * Curried function for setting the volume state of a file.
   */
  const setFreshVolumeOf = (
    path: string,
  ): ((x: { problems: Problem[]; volume: ChNVRVolume }) => void) => {
    return ({ problems, volume }) => {
      if (problems.length > 0) {
        pushProblems(problems);
      }
      updateStateAt(path, (fileState) => {
        return {
          ...fileState,
          volume: copyPropertiesToDefault(volume),
        };
      });
    };
  };

  /**
   * Unload all currently displayed volumes, then load the selected file.
   */
  const selectOnlyItem = (path: string) => {
    const nextFileStates = fileStates.map((fileState) => {
      const { volume, file } = fileState;
      if (path !== file.path) {
        return { file, volume: null };
      }
      if (volume !== null) {
        return fileState;
      }
      return startLoadingVolume(file);
    });
    setFileStates(nextFileStates);
  };

  /**
   * Load the selected file (without unloading others).
   */
  const addItemToSelection = (path: string) => {
    updateStateAt(path, ({ file }) => startLoadingVolume(file));
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

  const volumeOptionsMenu = (
    <div>
      <h1>hello, world!</h1>
    </div>
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
      body: volumeOptionsMenu,
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
        >
          {/* TODO set height to be 70% and scrollable */}
          <div style={{ height: "500px", overflowY: "scroll" }}>{body}</div>
        </Tab>
      ))}
    </Tabs>
  );
};

function iconFor<T>(volume: null | "loading" | T): React.ReactNode {
  if (volume === null) {
    return <PlusIcon />;
  }
  if (volume === "loading") {
    return <Spinner isInline />;
  }
  return <PlusCircleIcon />;
}

/**
 * Copy the properties of the given volume over to an object called "default".
 */
function copyPropertiesToDefault(volume: ChNVRVolume): DatasetVolume {
  const { url: _url, ...rest } = volume;
  return { state: volume, default: rest };
}

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default FilesMenu;
