import { Flex, FlexItem } from "@patternfly/react-core";
import type React from "react";
import { useEffect, useState } from "react";
import { fetchNote } from "../../api/common";
import type { IDrawerState } from "../../store/drawer/drawerSlice";
import { setDrawerCurrentlyActive } from "../../store/drawer/drawerSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Badge } from "../Antd";
import { ButtonWithTooltip } from "../Feeds/DrawerUtils";
import { handleToggle } from "../Feeds/utilties";
import {
  BrainIcon,
  AnalysisIcon,
  FeedBrowserIcon,
  NodeDetailsPanelIcon,
  NoteEditIcon,
  PreviewIcon,
  TerminalIcon,
} from "../Icons";
import "./feed-details.css";

const FeedDetails = () => {
  const currentFeed = useAppSelector((state) => state.feed.currentFeed.data);
  const dispatch = useAppDispatch();
  const drawerState = useAppSelector((state) => state.drawers);

  const node = drawerState.node.currentlyActive === "node";
  const note = drawerState.node.currentlyActive === "note";
  const terminal = drawerState.node.currentlyActive === "terminal";
  const preview = drawerState.preview.currentlyActive === "preview";

  const [showNoteBadge, setShowNoteBadge] = useState(false);

  useEffect(() => {
    fetchNote(currentFeed).then((feedNote) => {
      const showNote = !!(
        feedNote &&
        feedNote.data.content.length > 0 &&
        !note
      );
      setShowNoteBadge(showNote);
    });
  }, [note, currentFeed]);

  return (
    <Flex
      alignItems={{ default: "alignItemsCenter" }}
      justifyContent={{ default: "justifyContentCenter" }}
    >
      <FlexItem>
        <ButtonContainer
          title="Feed Tree Panel"
          Icon={<AnalysisIcon />}
          action="graph"
          dispatch={dispatch}
          drawerState={drawerState}
          isDisabled={drawerState.graph.open}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          title={node ? "Configuration Panel" : note ? "Feed Note" : "Terminal"}
          Icon={
            node ? (
              <NodeDetailsPanelIcon />
            ) : note ? (
              <NoteEditIcon />
            ) : (
              <TerminalIcon />
            )
          }
          action="node"
          dispatch={dispatch}
          drawerState={drawerState}
          isDisabled={drawerState.node.open}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          title="Files Table Panel"
          Icon={<FeedBrowserIcon />}
          action="files"
          dispatch={dispatch}
          drawerState={drawerState}
          isDisabled={drawerState.files.open}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          title="Preview Panel"
          Icon={preview ? <PreviewIcon /> : <BrainIcon />}
          action="preview"
          dispatch={dispatch}
          drawerState={drawerState}
          isDisabled={drawerState.preview.open}
        />
      </FlexItem>

      <FlexItem>
        <ButtonWithTooltip
          className="button-style large-button"
          position="bottom"
          content={!node && terminal ? "Configuration Panel" : "Terminal"}
          onClick={() => {
            if (terminal) {
              dispatch(
                setDrawerCurrentlyActive({
                  panel: "node",
                  currentlyActive: "node",
                }),
              );
            } else {
              dispatch(
                setDrawerCurrentlyActive({
                  panel: "node",
                  currentlyActive: "terminal",
                }),
              );
            }
          }}
          Icon={!node && terminal ? <NodeDetailsPanelIcon /> : <TerminalIcon />}
          isDisabled={false}
        />
      </FlexItem>

      <FlexItem>
        <Badge dot={!!(showNoteBadge && !note)} offset={[-5, 0]}>
          <ButtonWithTooltip
            className="button-style large-button"
            position="bottom"
            content={!note ? "Feed Note" : "Configuration Panel"}
            onClick={() => {
              if (note) {
                dispatch(
                  setDrawerCurrentlyActive({
                    panel: "node",
                    currentlyActive: "node",
                  }),
                );
              } else {
                dispatch(
                  setDrawerCurrentlyActive({
                    panel: "node",
                    currentlyActive: "note",
                  }),
                );
              }
            }}
            Icon={!node && note ? <NodeDetailsPanelIcon /> : <NoteEditIcon />}
            isDisabled={false}
          />
        </Badge>
      </FlexItem>

      <FlexItem>
        <ButtonWithTooltip
          className="button-style large-button"
          position="bottom"
          content={preview ? "Visualization Panel" : "Preview Panel"}
          onClick={() => {
            if (preview) {
              dispatch(
                setDrawerCurrentlyActive({
                  panel: "preview",
                  currentlyActive: "xtk",
                }),
              );
            } else {
              dispatch(
                setDrawerCurrentlyActive({
                  panel: "preview",
                  currentlyActive: "preview",
                }),
              );
            }
          }}
          Icon={preview ? <BrainIcon /> : <PreviewIcon />}
          isDisabled={false}
        />
      </FlexItem>
    </Flex>
  );
};

export default FeedDetails;

export const ButtonContainer = ({
  action,
  dispatch,
  Icon,
  title,
  drawerState,
  isDisabled,
}: {
  action: keyof IDrawerState;
  dispatch: any;
  Icon: React.ReactNode;
  title: string;
  drawerState: IDrawerState;
  isDisabled: boolean;
}) => {
  return (
    <ButtonWithTooltip
      position="bottom"
      className="button-style large-button"
      content={<span>{title}</span>}
      Icon={Icon}
      variant="primary"
      onClick={() => {
        handleToggle(action as keyof IDrawerState, drawerState, dispatch);
      }}
      isDisabled={isDisabled}
    />
  );
};
