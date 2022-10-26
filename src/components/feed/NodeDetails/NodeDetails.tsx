import React, { Fragment } from "react";

import Moment from "react-moment";
import {
  Button,
  Grid,
  GridItem,
  ExpandableSection,
  Tooltip,
  Popover as Popover_patternfly,
} from "@patternfly/react-core";

import { Popover, Progress } from "antd";
import {
  Plugin,
  PluginInstance,
  PluginInstanceDescendantList,
  PluginParameterList,
} from "@fnndsc/chrisapi";
import {
  FaDownload,
  FaTerminal,
  FaCalendarAlt,
  FaWindowClose,
  FaCopy,
} from "react-icons/fa";
import AddNode from "../AddNode/AddNode";
import DeleteNode from "../DeleteNode";
import PluginLog from "./PluginLog";
import Status from "./Status";
import StatusTitle from "./StatusTitle";
import PluginTitle from "./PluginTitle";

import { useTypedSelector } from "../../../store/hooks";
import "./NodeDetails.scss";
import { getErrorCodeMessage } from "./utils";
import AddPipeline from "../AddPipeline/AddPipeline";
import { SpinContainer } from "../../common/loading/LoadingContent";
import { useFeedBrowser } from "../FeedOutputBrowser/useFeedBrowser";
import { ClipboardCopy } from '@patternfly/react-core';
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
  const { download, downloadAllClick } = useFeedBrowser();
  const { plugin, instanceParameters, pluginParameters } = nodeState;
  const [isTerminalVisible, setIsTerminalVisible] = React.useState(false);
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
  
  const APIURL = selectedPlugin?.collection.items[0].links.find((obj:any) => (obj.rel === "files")).href
  const chrsCommand = `chrs download ${APIURL}`;

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
    return <SpinContainer background="#002030" title="Loading Node Details" />;
  } else {
    const Time = (
      <>
        <FaCalendarAlt />
        <Moment format="DD MMM YYYY @ HH:mm">
          {selectedPlugin.data.start_date}
        </Moment>
      </>
    );
    return (
      <div className="node-details">
        <div className="node-details__title">
          <PluginTitle />
          <FaWindowClose
            onClick={() => {
              expandDrawer("side_panel");
            }}
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

        <div className="node-details__actions">
          <div className="node-details__actions_first">
            {cancelled ? null : <AddNode />}
            <AddPipeline />

            <Button onClick={downloadAllClick} icon={<FaDownload />}>
              Download Files
            </Button>
            <Popover_patternfly
                  id="node-details-popover"
                  aria-label="Download command popover"
                  position="bottom"
                  headerContent={<div>chrs Download Files</div>}
                  hasAutoWidth
                  bodyContent={
                    <div>
                      <p>Run the command below in a terminal to download the files</p>
                      {/* <div className="pf-c-clipboard-copy">
                      <div className="pf-c-clipboard-copy__group">
                      <input className="pf-c-form-control" readOnly type="text" value={chrsCommandPath} aria-label="Readonly input example" />
                      <Tooltip aria="none" aria-live="polite" content={isCopied? copyText: doneCopyText}>
                      <button 
                       id="copy-button-1" 
                       aria-labelledby="copy-button-1 text-input-1" 
                       aria-disabled="false" aria-label="Copy to clipboard" 
                       className="pf-c-button pf-m-control" 
                       type="button" 
                       onClick={copyPathToClipboard}
                       data-ouia-safe="true" 
                       style={{height: "fit-content"}}
                       data-ouia-component-id="OUIA-Generated-Button-control-2">
                        <FaCopy />
                       </button>
                       </Tooltip>
                      </div>
                      </div> */}
                       <ClipboardCopy isReadOnly hoverTip="Copy To Clipboard" clickTip="Successfully Copied to Clipboard!">
                        {chrsCommand}
                       </ClipboardCopy>
                    </div>
                  }
                >
                  <Button icon={<FaCopy />}>
                    Copy Download Command
                  </Button>
            </Popover_patternfly>
          </div>
          <div className="node-details__actions_second">
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
              <Button icon={<FaTerminal />} type="button">
                View Terminal
              </Button>
            </Popover>
            {selectedPlugin.data.previous_id !== undefined && <DeleteNode />}
          </div>
        </div>
        {download.status && (
          <>
            <div style={{ width: 170, marginTop: "1.25em" }}>
              <Progress percent={download.count} size="small" />
            </div>
            <span>Fetching and Zipping files for {download.plugin_name} </span>
          </>
        )}
        <div style={{ marginTop: "1.25em" }}>
          {download.fetchingFiles && <span>Fetching file list meta data</span>}
        </div>
        <div style={{ marginTop: "1.25em" }}>
          {download.error && download.error}
        </div>
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
