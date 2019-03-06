import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CalendarAltIcon } from "@patternfly/react-icons";
import Moment from "react-moment";
import {
  IPluginItem,
  statusLabels
} from "../../api/models/pluginInstance.model";

type Props = {
  selected: IPluginItem;
};

const PluginInformation: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <div>
        <label>Status:</label>
        <FontAwesomeIcon icon="check" color="green" />
        {statusLabels[props.selected.status] || props.selected.status}
      </div>
      <div>
        <label>Start Date:</label>
        <CalendarAltIcon />
        <Moment format="DD MMM YYYY @ HH:mm">
          {props.selected.start_date}
        </Moment>
      </div>
      <div>
        <label>End Date:</label>
        <CalendarAltIcon />
         <Moment format="DD MMM YYYY @ HH:mm">
          {props.selected.end_date}
        </Moment>
      </div>
    </React.Fragment>
  );
};

export default React.memo(PluginInformation);
