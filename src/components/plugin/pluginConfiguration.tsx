import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Moment from "react-moment";
import {
  IPluginItem,
  statusLabels
} from "../../api/models/pluginInstance.model";

type Props = {
  selected: IPluginItem;
};

const PluginConfiguration: React.FunctionComponent<Props> = (props: Props) => (
  <React.Fragment>
    <div>
      <label>config Parameter 1:</label> $VALUE_1
    </div>
    <div>
      <label>config Parameter 2:</label> $VALUE_2
    </div>
    <div>
      <label>config Parameter 3:</label> $VALUE_3
    </div>
  </React.Fragment>
);

export default PluginConfiguration;
