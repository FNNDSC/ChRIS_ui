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
  Spinner,
} from "@patternfly/react-core";
import { Steps, Popover } from "antd";
import {
  Plugin,
  PluginInstance,
  PluginInstanceDescendantList,
  PluginParameterList,
} from "@fnndsc/chrisapi";
import {
  TerminalIcon,
  CaretDownIcon,
  CalendarAltIcon,
  CalendarDayIcon,
} from "@patternfly/react-icons";
import AddNode from "../AddNode/AddNode";
import DeleteNode from "../DeleteNode";
import "./NodeDetails.scss";
import TextCopyPopover from "../../common/textcopypopover/TextCopyPopover";
import { ResourcePayload, PluginInstancePayload, PluginStatus } from "../../../store/feed/types";
import { getPluginInstances, getSelected, getSelectedInstanceResource } from "../../../store/feed/selector";
import { setFeedLayout } from "../../../store/feed/actions";


const { Step } = Steps;


interface INodeProps {
  selected?: PluginInstance;
  pluginInstanceResource?: ResourcePayload;
  pluginInstances?: PluginInstancePayload;
  setFeedLayout: typeof setFeedLayout;
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
  pluginInstanceResource,
  setFeedLayout,
}) => {
  const [nodeState, setNodeState] = React.useState<INodeState>(getInitialState);
  const { plugin, instanceParameters, pluginParameters } = nodeState;
  const pluginStatus =
      pluginInstanceResource && pluginInstanceResource.pluginStatus;


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

  const runTime = React.useCallback(getRuntimeString, [selected, pluginStatus]);

  const pluginTitle = React.useMemo(() => {
    return (
      selected?.data.title ||
      `${selected?.data.plugin_name} v. ${selected?.data.plugin_version}`
    );
  }, [selected]);

  let statusTitle:string | undefined=undefined;

  if(pluginStatus){
    statusTitle= getCurrentTitleFromStatus(pluginStatus);
  }

   
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
          <TextCopyPopover
            text={
              plugin && instanceParameters && pluginParameters
                ? command(plugin, instanceParameters, pluginParameters)
                : ""
            }
            headerContent={`Docker Command for ${pluginTitle}`}
            max-width="80rem"
            rows={15}
            className="view-command-wrap"
          >
            <Button>
              <TerminalIcon />
              View Command
              <CaretDownIcon />
            </Button>
          </TextCopyPopover>
        </div>
        <Grid className="node-details__grid">
          <GridItem span={2} className="title">
            Status
          </GridItem>
          <GridItem span={10} className="value">
            {statusTitle ? (
              statusTitle
            ) : (
              <Skeleton width="25%" screenreaderText="Fetching Status" />
            )}
          </GridItem>

          <GridItem span={2} className="title"></GridItem>
          <GridItem span={10} className="value">
            <Steps direction="horizontal" size="small">
              {pluginStatus &&
                pluginStatus.map((label: any) => {
                  let showIcon = [
                    "Finished Successfully",
                    "Finished With Error",
                    "Cancelled",
                  ].includes(label.title)
                    ? false
                    : label.isCurrentStep
                    ? true
                    : false;

                  return (
                    <Step
                      key={label.id}
                      icon={showIcon && <Spinner size="lg" />}
                      status={
                        label.status === true
                          ? "finish"
                          : label.error === true
                          ? "error"
                          : undefined
                      }
                    />
                  );
                })}
            </Steps>
          </GridItem>

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
        <div className="node-details__actions">
          {selected.data.status === "finishedWithError" ||
          selected.data.status === "cancelled" ? null : (
            <AddNode />
          )}
          {!selected.data.plugin_name.includes("dircopy") && <DeleteNode />}
        </div>
        <div className="node-details__actions">
          <Button onClick={() => setFeedLayout()}>Switch Layout</Button>
        </div>

        <div className="node-details__infoLabel">
          <label>Plugin output may be viewed below.</label>
        </div>
      </div>
    );
  }
};

const mapStateToProps = (state: ApplicationState) => ({
  selected: getSelected(state),
  pluginInstanceResource: getSelectedInstanceResource(state),
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

    let command = `docker run --rm \\\n-v $(pwd)/in:/incoming \\\n-v $(pwd)/out:/outgoing \\\n${dock_image} \\\n${selfexec} \\\n`;
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


function getCurrentTitleFromStatus(statusLabels:PluginStatus[]){

  const title= statusLabels.map((label)=>{
    if(label.isCurrentStep===true){
      return label.title
    }
  }).filter(label => label && label);

  return title[0];

}