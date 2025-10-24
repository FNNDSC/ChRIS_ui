import { Flex, FlexItem } from "@patternfly/react-core";
import { useEffect, useState } from "react";
import { fetchNote } from "../../api/common";
import { Badge } from "../Antd";
import { ButtonWithTooltip } from "../Feeds/DrawerUtils";
import {
  AnalysisIcon,
  BrainIcon,
  FeedBrowserIcon,
  NodeDetailsPanelIcon,
  NoteEditIcon,
  PreviewIcon,
  TerminalIcon,
} from "../Icons";
import ButtonContainer from "./ButtonContainer";
import "./feed-details.css";
import {
  getRootID,
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import * as DoDrawer from "../../reducers/drawer";
import * as DoFeed from "../../reducers/feed";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

type Props = {
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
};

export default (props: Props) => {
  const { useDrawer, useFeed } = props;
  const [classStateDrawer, doDrawer] = useDrawer;
  const drawerState = getState(classStateDrawer) || DoDrawer.defaultState;
  const drawerID = getRootID(classStateDrawer);

  const [classStateFeed, _] = useFeed;
  const feedState = getState(classStateFeed) || DoFeed.defaultState;

  const { data: currentFeed } = feedState;

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
          actionType="graph"
          icon={<AnalysisIcon />}
          title="Feed Tree Panel"
          isDisabled={drawerState.graph.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          actionType="node"
          title={node ? "Configuration Panel" : note ? "Feed Note" : "Terminal"}
          icon={
            node ? (
              <NodeDetailsPanelIcon />
            ) : note ? (
              <NoteEditIcon />
            ) : (
              <TerminalIcon />
            )
          }
          isDisabled={drawerState.node.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          actionType="files"
          title="Files Table Panel"
          icon={<FeedBrowserIcon />}
          isDisabled={drawerState.files.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonContainer
          actionType="preview"
          title="Preview Panel"
          icon={preview ? <PreviewIcon /> : <BrainIcon />}
          isDisabled={drawerState.preview.open}
          useDrawer={useDrawer}
        />
      </FlexItem>

      <FlexItem>
        <ButtonWithTooltip
          className="button-style large-button"
          position="bottom"
          content={!node && terminal ? "Configuration Panel" : "Terminal"}
          onClick={() => {
            if (terminal) {
              doDrawer.setDrawerCurrentlyActive(drawerID, "node", "node");
            } else {
              doDrawer.setDrawerCurrentlyActive(drawerID, "node", "terminal");
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
                doDrawer.setDrawerCurrentlyActive(drawerID, "node", "node");
              } else {
                doDrawer.setDrawerCurrentlyActive(drawerID, "node", "note");
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
              doDrawer.setDrawerCurrentlyActive(drawerID, "preview", "xtk");
            } else {
              doDrawer.setDrawerCurrentlyActive(drawerID, "preview", "preview");
            }
          }}
          Icon={preview ? <BrainIcon /> : <PreviewIcon />}
          isDisabled={false}
        />
      </FlexItem>
    </Flex>
  );
};
