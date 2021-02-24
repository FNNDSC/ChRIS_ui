import React, {Fragment} from 'react';
import Moment from "react-moment";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../../store/root/applicationState";
import {
  Button,
  Grid,
  GridItem,
  Title,
  Skeleton,
  ExpandableSection,  
} from "@patternfly/react-core";
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
  CalendarAltIcon,
  CalendarDayIcon,
  CloseIcon,
} from "@patternfly/react-icons";
import AddNode from "../AddNode/AddNode";
import DeleteNode from "../DeleteNode";
import PluginLog from './PluginLog';
import Status from './Status';
import StatusTitle from "./StatusTitle";
import { PluginInstancePayload, } from "../../../store/feed/types";
import { getPluginInstances, getSelected } from "../../../store/feed/selector";
import { setFeedLayout } from "../../../store/feed/actions";
import "./NodeDetails.scss";


interface INodeProps {
  selected?: PluginInstance;
  pluginInstances?: PluginInstancePayload;
  setFeedLayout: typeof setFeedLayout;
  expandDrawer: () => void;
}

interface INodeState {
  plugin?: Plugin;
  instanceParameters?: PluginInstanceDescendantList;
  pluginParameters?: PluginParameterList;
}

function getInitialState(){
  return {
    plugin: undefined,
    instanceParameters:undefined,
    pluginParameters: undefined,
  };
}

const NodeDetails: React.FC<INodeProps> = ({
  selected,
  setFeedLayout,
  expandDrawer,
}) => {
  const [nodeState, setNodeState] = React.useState<INodeState>(getInitialState);
  const { plugin, instanceParameters, pluginParameters } = nodeState;
  const [isVisible, setIsVisible] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      const instanceParameters = await selected?.getParameters({
        limit: 100,
        offset: 0,
      });

      const plugin = await selected?.getPlugin();
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
  }, [selected]);

  const command = React.useCallback(getCommand, [
    plugin,
    instanceParameters,
    pluginParameters,
  ]);

  const text =
    plugin && instanceParameters && pluginParameters
      ? command(plugin, instanceParameters, pluginParameters)
      : "";

  const runTime = React.useCallback(getRuntimeString, [selected]);

  const pluginTitle = React.useMemo(() => {
    return (
      selected?.data.title ||
      `${selected?.data.plugin_name} v. ${selected?.data.plugin_version}`
    );
  }, [selected]);

  if (!selected) {
    return (
      <Skeleton
        height="75%"
        width="75%"
        screenreaderText="Loading Node details"
      />
    );
  } else {
    
   
    return (
      <div className="node-details">
        <div className="node-details__title">
          <Title headingLevel="h3" size="xl">
            {pluginTitle}
          </Title>
          <Button onClick={expandDrawer} type="button" icon={<CloseIcon />} />
        </div>

        <Grid className="node-details__grid">
          <GridItem span={2} className="title">
            Status
          </GridItem>
          <GridItem span={10} className="value">
            <StatusTitle />
          </GridItem>

          <GridItem span={12} className="value">
            <Status />
          </GridItem>

          <ExpandableSection
            toggleText={isExpanded ? "Show Less Details" : "Show More Details"}
            onToggle={() => setIsExpanded(!isExpanded)}
            isExpanded={isExpanded}
            className="node-details__expandable"
          >
            <Grid className="node-details__grid">
              <GridItem span={2} className="title">
                Created
              </GridItem>
              <GridItem span={10} className="value">
                <CalendarDayIcon />
                <Moment format="DD MMM YYYY @ HH:mm">
                  {selected.data.start_date}
                </Moment>
              </GridItem>

              <GridItem span={2} className="title">
                Node ID
              </GridItem>
              <GridItem span={10} className="value">
                {selected.data.id}
              </GridItem>
              {runTime && (
                <Fragment>
                  <GridItem span={2} className="title">
                    <CalendarAltIcon />
                    Total Runtime:
                  </GridItem>
                  <GridItem span={10} className="value">
                    {selected && selected.data && runTime(selected)}
                  </GridItem>
                </Fragment>
              )}
            </Grid>
          </ExpandableSection>
        </Grid>
        <div className="node-details__actions">
          {selected.data.status === "finishedWithError" ||
          selected.data.status === "cancelled" ? null : (
            <AddNode />
          )}

          {
            //@ts-ignore
            selected.data.previous_id !== undefined && <DeleteNode />
          }
          <Button
            icon={<BezierCurveIcon />}
            type="button"
            onClick={() => setFeedLayout()}
          >
            Switch Layout
          </Button>
        </div>

        <div className="node-details__infoLabel">
          <Popover
            content={<PluginLog text={text} />}
            title="Terminal"
            placement="bottom"
            visible={isVisible}
            trigger="click"
            onVisibleChange={(visible: boolean) => {
              setIsVisible(visible);
            }}
          >
            <Button
              className="node-details__popover-button"
              icon={<TerminalIcon />}
              type="button"
            >
              View Terminal
            </Button>
          </Popover>
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: ApplicationState) => ({
  selected: getSelected(state),
  instances: getPluginInstances(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFeedLayout: () => dispatch(setFeedLayout()),
});


export default connect(mapStateToProps, mapDispatchToProps)(NodeDetails);


function getRuntimeString(selected:PluginInstance) {
  let runtime = 0;
  const start = new Date(selected.data.start_date);
  const end = new Date(selected.data.end_date);
  const elapsed = end.getTime() - start.getTime(); // milliseconds between start and end
  runtime += elapsed;

  // format millisecond amount into human-readable string
  let runtimeStrings = [];
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
  let modifiedParams: {
    name?: string;
    value?: string;
  }[] = [];

  let instanceParameters=params.getItems();
  let pluginParameters=parameters.getItems();
  

    for (let i = 0; i < instanceParameters.length; i++) {
      for (let j = 0; j < pluginParameters.length; j++) {
        if (instanceParameters[i].data.param_name === pluginParameters[j].data.name) {
          modifiedParams.push({
            name: pluginParameters[j].data.flag,
            value: instanceParameters[i].data.value,
          });
        }
      }
    }

    let command = `$> docker run --rm -v $(pwd)/in:/incoming -v $(pwd)/out:/outgoing \\\n${dock_image} ${selfexec} `;
    let parameterCommand=[]
    
    
    if (modifiedParams.length) {
      parameterCommand=modifiedParams.map((param) => `${param.name} ${param.value}`);
      if(parameterCommand.length>0){
        command += parameterCommand.join(" ") + " \\\n";
      }
    }
    command = `${command}/incoming /outgoing`.trim();
  
    return command;
}


