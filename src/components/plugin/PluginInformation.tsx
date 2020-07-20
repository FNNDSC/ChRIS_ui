import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CalendarAltIcon } from "@patternfly/react-icons";
import Moment from "react-moment";
import { statusLabels } from "../../api/models/pluginInstance.model";
import { PluginInstance } from "@fnndsc/chrisapi";

type Props = {
  selected: PluginInstance;
};

const PluginInformation: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <div>
        <label>Status:</label>
        <FontAwesomeIcon icon="check" color="green" />
        {statusLabels[props.selected.data.status] || props.selected.data.status}
      </div>
      <div>
        <label>Start Date:</label>
        <CalendarAltIcon />
        <Moment format="DD MMM YYYY @ HH:mm">
          {props.selected.data.start_date}
        </Moment>
      </div>
      <div>
        <label>End Date:</label>
        <CalendarAltIcon />
        <Moment format="DD MMM YYYY @ HH:mm">
          {props.selected.data.end_date}
        </Moment>
      </div>
    </React.Fragment>
  );
};

export default React.memo(PluginInformation);
