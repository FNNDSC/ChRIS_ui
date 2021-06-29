import React, { Fragment } from "react";
import Moment from "react-moment";
import {
  Button,
  Grid,
  GridItem,
  Skeleton,
  ExpandableSection,
} from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import { Popover } from "antd";
import {
  Plugin,
  PluginInstance,
  PluginInstanceDescendantList,
  PluginParameterList,
} from "@fnndsc/chrisapi";
import {
  BezierCurveIcon,
  TerminalIcon,
  CalendarDayIcon,
  CloseIcon,
} from "@patternfly/react-icons";
import AddNode from "../AddNode/AddNode";
import DeleteNode from "../DeleteNode";
import PluginLog from "./PluginLog";
import Status from "./Status";
import GraphNode from "../AddTsNode/ParentContainer";
import StatusTitle from "./StatusTitle";
import PluginTitle from "./PluginTitle";
import { setFeedLayout } from "../../../store/feed/actions";
import { useTypedSelector } from "../../../store/hooks";
import "./NodeDetails.scss";

interface INodeProps {
  expandDrawer: (panel: string) => void;
}

interface INodeState {
  plugin?: Plugin;
  instanceParameters?: PluginInstanceDescendantList;
  pluginParameters?: PluginParameterList;
}

function getInitialState() {
  return {
    plugin: undefined,
    instanceParameters: undefined,
    pluginParameters: undefined,
  };
}

const NodeDetails: React.FC<INodeProps> = ({ expandDrawer }) => {
  const [nodeState, setNodeState] = React.useState<INodeState>(getInitialState);
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );

  const dispatch = useDispatch();
  const { plugin, instanceParameters, pluginParameters } = nodeState;
  const [isTerminalVisible, setIsTerminalVisible] = React.useState(false);
  const [isGraphNodeVisible, setIsGraphNodeVisible] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      const instanceParameters = await selectedPlugin?.getParameters({
        limit: 100,
        offset: 0,
      });

      const plugin = await selectedPlugin?.getPlugin();
      const pluginParameters = await plugin?.getPluginParameters({
        limit: 100,
        offset: 0,
      });

      if (pluginParameters && instanceParameters) {
        setNodeState({
          plugin,
          instanceParameters,
          pluginParameters,
        });
      }
    };

    fetchData();
  }, [selectedPlugin]);

  const command = React.useCallback(getCommand, [
    plugin,
    instanceParameters,
    pluginParameters,
  ]);

  const text =
    plugin && instanceParameters && pluginParameters
      ? command(plugin, instanceParameters, pluginParameters)
      : "";

  const runTime = React.useCallback(getRuntimeString, [selectedPlugin]);

  const cancelled =
    selectedPlugin?.data.status === "cancelled" ||
    selectedPlugin?.data.status === "finishedWithError";

  //@ts-ignore
  const error_code = selectedPlugin?.data.error_code;
  //@ts-ignore
  const compute_env = selectedPlugin?.data.compute_resource_name;

  const previousId = selectedPlugin?.data.previous_id;

  const handleVisibleChange = (visible: boolean) => {
    setIsGraphNodeVisible(visible);
  };

  const renderGridItem = (title: string, value: React.ReactNode) => {
    return (
      <>
        <GridItem className="title" span={2}>
          {title}
        </GridItem>
        <GridItem className="value" span={10}>
          {value}
        </GridItem>
      </>
    );
  };

  if (!selectedPlugin) {
    return (
      <Skeleton
        height="75%"
        width="75%"
        screenreaderText="Loading Node details"
      />
    );
  } else {
    const Time = (
      <>
        <CalendarDayIcon />
        <Moment format="DD MMM YYYY @ HH:mm">
          {selectedPlugin.data.start_date}
        </Moment>
      </>
    );
    return (
      <div className="node-details">
        <div className="node-details__title">
          <PluginTitle />
          <Button
            onClick={() => {
              expandDrawer("side_panel");
            }}
            variant="tertiary"
            type="button"
            icon={<CloseIcon />}
            className="node-details__title--button"
          />
        </div>

        <Grid className="node-details__grid">
          {renderGridItem("Status", <StatusTitle />)}
        </Grid>

        <Status />
        <ExpandableSection
          toggleText={isExpanded ? "Show Less Details" : "Show More Details"}
          onToggle={() => setIsExpanded(!isExpanded)}
          isExpanded={isExpanded}
          className="node-details__expandable"
        >
          <Grid className="node-details__grid">
            {renderGridItem(
              "Parent Node ID",
              <span>{previousId ? previousId : "None"}</span>
            )}
            {renderGridItem(
              "Selected Node ID",
              <span>{selectedPlugin.data.id}</span>
            )}
            {renderGridItem("Created", Time)}
            {renderGridItem("Compute Environment", <span>{compute_env}</span>)}
            {runTime && (
              <Fragment>
                {renderGridItem(
                  "Total Runtime",
                  <span>
                    {selectedPlugin &&
                      selectedPlugin.data &&
                      runTime(selectedPlugin)}
                  </span>
                )}
              </Fragment>
            )}
            {cancelled &&
              renderGridItem(
                "Error Code",
                <span>{error_code ? error_code : "None"}</span>
              )}
          </Grid>
        </ExpandableSection>

        <div className="node-details__actions">
          <Popover
            className="node-details__popover"
            content={<PluginLog text={text} />}
            placement="bottom"
            visible={isTerminalVisible}
            trigger="click"
            onVisibleChange={(visible: boolean) => {
              setIsTerminalVisible(visible);
            }}
          >
            <Button icon={<TerminalIcon />} type="button">
              View Terminal
            </Button>
          </Popover>
          {cancelled ? null : <AddNode />}

          <Popover
            content={
              <GraphNode
                visible={isGraphNodeVisible}
                onVisibleChange={handleVisibleChange}
              />
            }
            placement="bottom"
            visible={isGraphNodeVisible}
            onVisibleChange={handleVisibleChange}
            trigger="click"
          >
            <Button type="button" icon={<BezierCurveIcon />}>
              Add a Graph Node
            </Button>
          </Popover>

          {selectedPlugin.data.previous_id !== undefined && <DeleteNode />}
          <Button
            icon={<BezierCurveIcon />}
            type="button"
            onClick={() => dispatch(setFeedLayout())}
            variant="primary"
          >
            Switch Layout
          </Button>
        </div>

        <div className="node-details__infoLabel"></div>
      </div>
    );
  }
};

export default NodeDetails;

function getRuntimeString(selected: PluginInstance) {
  let runtime = 0;
  const start = new Date(selected.data.start_date);
  const end = new Date(selected.data.end_date);
  const elapsed = end.getTime() - start.getTime(); // milliseconds between start and end
  runtime += elapsed;

  // format millisecond amount into human-readable string
  const runtimeStrings = [];
  const timeParts = [
    ["day", Math.floor(runtime / (1000 * 60 * 60 * 24))],
    ["hr", Math.floor((runtime / (1000 * 60 * 60)) % 24)],
    ["min", Math.floor((runtime / 1000 / 60) % 60)],
    ["sec", Math.floor((runtime / 1000) % 60)],
  ];
  for (const part of timeParts) {
    const [name, value] = part;
    if (value > 0) {
      runtimeStrings.push(`${value} ${name}`);
    }
  }
  return runtimeStrings.join(", ");
}

function getCommand(
  plugin: Plugin,
  params: PluginInstanceDescendantList,
  parameters: PluginParameterList
) {
  const { dock_image, selfexec } = plugin.data;
  const modifiedParams: {
    name?: string;
    value?: string;
  }[] = [];

  const instanceParameters = params.getItems();
  const pluginParameters = parameters.getItems();

  for (let i = 0; i < instanceParameters.length; i++) {
    for (let j = 0; j < pluginParameters.length; j++) {
      if (
        instanceParameters[i].data.param_name === pluginParameters[j].data.name
      ) {
        modifiedParams.push({
          name: pluginParameters[j].data.flag,
          value: instanceParameters[i].data.value,
        });
      }
    }
  }

  let command = `$> docker run --rm -v $(pwd)/in:/incoming -v $(pwd)/out:/outgoing \\\n${dock_image} ${selfexec} `;
  let parameterCommand = [];

  if (modifiedParams.length) {
    parameterCommand = modifiedParams.map(
      (param) => `${param.name} ${param.value}`
    );
    if (parameterCommand.length > 0) {
      command += parameterCommand.join(" ") + " \\\n";
    }
  }
  command = `${command}/incoming /outgoing \n \n`;

  return command;
}
