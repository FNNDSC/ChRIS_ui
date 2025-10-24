import type {
  Plugin,
  PluginInstance,
  PluginInstanceDescendantList,
  PluginParameterList,
} from "@fnndsc/chrisapi";
import {
  Button,
  ExpandableSection,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import React, { Fragment, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router";
import { customQuote, needsQuoting } from "../../api/common";
import { useAppSelector } from "../../store/hooks";
import { SpinContainer } from "../Common";
import { isPlVisualDataset } from "../DatasetRedirect/getDatasets";
import FeedNote from "../FeedDetails/FeedNote";
import { CalendarAltIcon, PreviewIcon } from "../Icons";
import "./NodeDetails.css";
import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import * as DoDrawer from "../../reducers/drawer";
import * as DoFeed from "../../reducers/feed";
import PluginLog from "./PluginLog";
import PluginTitle from "./PluginTitle";
import Status from "./Status";
import StatusTitle from "./StatusTitle";
import { usePluginInstanceResourceQuery } from "./usePluginInstanceResource";
import { getErrorCodeMessage } from "./utils";

type TDoDrawer = ThunkModuleToFunc<typeof DoDrawer>;
type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

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

type Props = {
  useDrawer: UseThunk<DoDrawer.State, TDoDrawer>;
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
};

export default (props: Props) => {
  const { useDrawer, useFeed } = props;
  const [classStateDrawer, _] = useDrawer;
  const drawer = getState(classStateDrawer) || DoDrawer.defaultState;
  const { node } = drawer;

  const [classStateFeed, _2] = useFeed;
  const feedState = getState(classStateFeed) || DoFeed.defaultState;
  const { data: feed } = feedState;

  const [nodeState, setNodeState] = React.useState<INodeState>(getInitialState);
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );
  const navigate = useNavigate();
  const { plugin, instanceParameters, pluginParameters } = nodeState;
  const [isExpanded, setIsExpanded] = React.useState(true);
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

  const { data } = usePluginInstanceResourceQuery(selectedPlugin);

  const command = React.useCallback(getCommand, []);

  const text =
    plugin && instanceParameters && pluginParameters
      ? command(plugin, instanceParameters, pluginParameters)
      : "";

  const runTime = React.useCallback(getRuntimeString, []);

  const cancelled =
    selectedPlugin?.data.status === "cancelled" ||
    selectedPlugin?.data.status === "finishedWithError";

  const error_code = selectedPlugin?.data.error_code;
  const compute_env = selectedPlugin?.data.compute_resource_name;

  const renderGridItem = (title: string, value: React.ReactNode) => {
    return (
      <>
        <GridItem className="title" span={2} style={{ marginBottom: "1em" }}>
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
  }
  const Time = (
    <>
      <CalendarAltIcon style={{ marginRight: "0.5em" }} />
      {selectedPlugin.data.start_date}
    </>
  );
  return (
    <ErrorBoundary
      fallback={
        <Button
          onClick={() => {
            feed && navigate(`/feeds/${feed.data.id}?type='private'`);
          }}
          variant="link"
        >
          Refresh
        </Button>
      }
    >
      <div className="node-details">
        {node.currentlyActive === "terminal" ? (
          <PluginLog text={text} log={data?.pluginLog} />
        ) : node.currentlyActive === "note" ? (
          <FeedNote useFeed={useFeed} />
        ) : (
          <>
            <PluginTitle />
            <Grid className="node-details__grid">
              {renderGridItem(
                "Status",
                <StatusTitle pluginStatus={data?.pluginStatus} />,
              )}
            </Grid>
            <Status pluginStatus={data?.pluginStatus} />

            <ExpandableSection
              toggleText={
                isExpanded ? "Show Less Details" : "Show More Details"
              }
              onToggle={() => setIsExpanded(!isExpanded)}
              isExpanded={isExpanded}
              className="node-details__expandable"
            >
              <Grid className="node-details__grid">
                {renderGridItem("Feed Name", feed?.data?.name)}
                {renderGridItem("Feed Author", feed?.data.owner_username)}
                {selectedPlugin.data.previous_id &&
                  renderGridItem(
                    "Parent Node ID",
                    <span>{selectedPlugin.data.previous_id}</span>,
                  )}
                {renderGridItem(
                  "Selected Node ID",
                  <span>{selectedPlugin.data.id}</span>,
                )}
                {renderGridItem(
                  "Plugin",
                  <span style={{ fontFamily: "monospace" }}>
                    {selectedPlugin.data.plugin_name}, ver{" "}
                    {selectedPlugin.data.plugin_version}
                  </span>,
                )}
                {renderGridItem("Created", Time)}
                {renderGridItem(
                  "Compute Environment",
                  <span>{compute_env}</span>,
                )}
                {runTime && (
                  <Fragment>
                    {renderGridItem(
                      "Total Runtime",
                      <span>
                        {selectedPlugin?.data && runTime(selectedPlugin)}
                      </span>,
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
                    </span>,
                  )}
              </Grid>
            </ExpandableSection>

            {
              // Jennings: hastily adding an extra button here.
              // IMO the Node Details pane should be cleaned up.
              isPlVisualDataset(selectedPlugin) && (
                <Grid hasGutter={true}>
                  <RenderButtonGridItem>
                    <Button
                      icon={<PreviewIcon />}
                      onClick={() =>
                        navigate(`/niivue/${selectedPlugin.data.id}`)
                      }
                    >
                      View Volumes{" "}
                      {/* I didn't make this shortcut work, since none of them currently work in caae85dd1cb337c11179724eedf3b81ac6373aaa */}
                      <span style={{ padding: "2px", color: "#F5F5DC" }}>
                        ( V )
                      </span>
                    </Button>
                  </RenderButtonGridItem>
                </Grid>
              )
            }
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

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
  parameters: PluginParameterList,
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

  // Create a lookup map for plugin parameters to avoid O(n²) nested loop
  const pluginParamsMap = new Map();
  for (const pluginParam of pluginParameters) {
    pluginParamsMap.set(pluginParam.data.name, pluginParam);
  }

  // Single pass through instance parameters - O(n) complexity
  for (const instanceParam of instanceParameters) {
    const pluginParam = pluginParamsMap.get(instanceParam.data.param_name);

    if (pluginParam) {
      const isBoolean = instanceParam.data.type === "boolean";
      const isString = instanceParam.data.type === "string";
      const value = instanceParam.data.value;
      const paramName = instanceParam.data.param_name;

      // Check if parameter name contains "password" (case insensitive)
      const isPassword =
        paramName.toLowerCase().includes("password") ||
        pluginParam.data.flag?.toLowerCase().includes("password");

      // If it's a password, mask the value with asterisks of the same length
      const displayValue = isPassword
        ? "*".repeat(value ? value.length : 0)
        : value;

      // For password fields, ensure the masked value is used consistently
      const safeValue = isPassword
        ? displayValue
        : isString && needsQuoting(displayValue)
          ? customQuote(displayValue)
          : displayValue;

      modifiedParams.push({
        name: pluginParam.data.flag,
        value: isBoolean ? " " : safeValue,
      });
    }
  }

  let command = `$> apptainer exec --bind $PWD/in:/incoming,$PWD/out:/outgoing docker://${dock_image} ${selfexec} `;
  let parameterCommand = [];

  if (modifiedParams.length) {
    parameterCommand = modifiedParams.map(
      (param) => `${param.name} ${param.value}`,
    );
    if (parameterCommand.length > 0) {
      command += `${parameterCommand.join(" ")} \\\n`;
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
};
