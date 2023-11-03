import React, { Fragment, ReactNode } from "react";
import {
  Button,
  Grid,
  GridItem,
  ExpandableSection,
} from "@patternfly/react-core";
import {
  Plugin,
  PluginInstance,
  PluginInstanceDescendantList,
  PluginParameterList,
} from "@fnndsc/chrisapi";
import CalendarAlt from "@patternfly/react-icons/dist/esm/icons/calendar-alt-icon";
import AddNodeConnect from "../AddNode/AddNode";
import DeleteNode from "../DeleteNode";
import PluginLog from "./PluginLog";
import Status from "./Status";
import StatusTitle from "./StatusTitle";
import PluginTitle from "./PluginTitle";
import GraphNodeContainer from "../AddTsNode";
import AddPipeline from "../AddPipeline/AddPipeline";
import FeedNote from "../FeedDetails/FeedNote";
import { useTypedSelector } from "../../store/hooks";
import { getErrorCodeMessage } from "./utils";
import { SpinContainer } from "../Common";
import { PipelineProvider } from "../CreateFeed/context";
import { AddNodeProvider } from "../AddNode/context";
import "./NodeDetails.css";

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

const NodeDetails: React.FC = () => {
  const [nodeState, setNodeState] = React.useState<INodeState>(getInitialState);
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const drawerState = useTypedSelector((state) => state.drawers);

  const { plugin, instanceParameters, pluginParameters } = nodeState;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isErrorExpanded, setisErrorExpanded] = React.useState(false);

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
    return <SpinContainer title="Loading Node Details" />;
  } else {
    const Time = (
      <>
        <CalendarAlt />

        {selectedPlugin.data.start_date}
      </>
    );
    return (
      <div className="node-details">
        {drawerState["node"].currentlyActive === "terminal" ? (
          <PluginLog text={text} />
        ) : drawerState["node"].currentlyActive === "note" ? (
          <FeedNote />
        ) : (
          <>
            <div className="node-details__title">
              <PluginTitle />
            </div>

            <Grid className="node-details__grid">
              {renderGridItem("Status", <StatusTitle />)}
            </Grid>

            <Status />

            <ExpandableSection
              toggleText={
                isExpanded ? "Show Less Details" : "Show More Details"
              }
              onToggle={() => setIsExpanded(!isExpanded)}
              isExpanded={isExpanded}
              className="node-details__expandable"
            >
              <Grid className="node-details__grid">
                {selectedPlugin.data.previous_id &&
                  renderGridItem(
                    "Parent Node ID",
                    <span>{selectedPlugin.data.previous_id}</span>
                  )}
                {renderGridItem(
                  "Selected Node ID",
                  <span>{selectedPlugin.data.id}</span>
                )}
                {renderGridItem(
                  "Plugin",
                  <span style={{ fontFamily: "monospace" }}>
                    {selectedPlugin.data.plugin_name}, ver{" "}
                    {selectedPlugin.data.plugin_version}
                  </span>
                )}
                {renderGridItem("Created", Time)}
                {renderGridItem(
                  "Compute Environment",
                  <span>{compute_env}</span>
                )}
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
                    <span>
                      {error_code ? (
                        <span>
                          {error_code}&nbsp;
                          {isErrorExpanded && (
                            <span className="node-details__error-message">
                              {getErrorCodeMessage(error_code)}&nbsp;
                            </span>
                          )}
                          <Button
                            variant="link"
                            isInline
                            className="node-details__error-show-more"
                            onClick={() => setisErrorExpanded(!isErrorExpanded)}
                          >
                            (show {isErrorExpanded ? "less" : "more"})
                          </Button>
                        </span>
                      ) : (
                        "None"
                      )}
                    </span>
                  )}
              </Grid>
            </ExpandableSection>

            <Grid className="node-details__grid" hasGutter={true}>
              <Grid className="node-details__grid" hasGutter={true}>
                {cancelled ? null : (
                  <AddNodeProvider>
                    <RenderButtonGridItem>
                      {" "}
                      <AddNodeConnect />
                    </RenderButtonGridItem>
                  </AddNodeProvider>
                )}
                <RenderButtonGridItem>
                  <PipelineProvider>
                    <AddPipeline />
                  </PipelineProvider>
                </RenderButtonGridItem>
              </Grid>

              <Grid hasGutter={true}>
                <RenderButtonGridItem>
                  <GraphNodeContainer />
                </RenderButtonGridItem>

                {selectedPlugin.data.previous_id !== undefined && (
                  <RenderButtonGridItem>
                    <DeleteNode />
                  </RenderButtonGridItem>
                )}
              </Grid>
            </Grid>
          </>
        )}
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
    if (+value > 0) {
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

  let instanceParameters = [];
  let pluginParameters = [];
  if (params.getItems()) {
    instanceParameters = params.getItems() as any[];
  }
  if (parameters.getItems()) {
    pluginParameters = parameters.getItems() as any[];
  }

  for (let i = 0; i < instanceParameters.length; i++) {
    for (let j = 0; j < pluginParameters.length; j++) {
      if (
        instanceParameters[i].data.param_name === pluginParameters[j].data.name
      ) {
        const boolean = instanceParameters[i].data.type === "boolean";

        modifiedParams.push({
          name: pluginParameters[j].data.flag,
          value: boolean ? "" : instanceParameters[i].data.value,
        });
      }
    }
  }

  let command = `$> apptainer exec --bind $PWD/in:/incoming,$PWD/out:/outgoing docker://${dock_image} ${selfexec} `;
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

const RenderButtonGridItem = ({ children }: { children: ReactNode }) => {
  return (
    <GridItem sm={12} lg={6} xl={5} xl2={5}>
      {children}
    </GridItem>
  );
  4;
};
