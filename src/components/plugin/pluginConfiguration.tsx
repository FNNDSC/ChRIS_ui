import * as React from "react";
import { connect } from "react-redux";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { ApplicationState } from "../../store/root/applicationState";
import { IPluginState } from "../../store/plugin/types";
import { pf4UtilityStyles } from "../../lib/pf4-styleguides";
class PluginConfiguration extends React.Component<IPluginState> {
  render() {
    const { parameters } = this.props;
    return (
      !!parameters && <React.Fragment>
        {parameters.length > 0 ? (
          parameters.map((param: any) => {
            return (
              <div key={`param_${param.id}`}>
                <label>{param.param_name}:</label> {param.value}
              </div>
            );
          })
        ) : (
            <p className={`${pf4UtilityStyles.spacingStyles.mb_md}`}>
              <ExclamationCircleIcon color="#007bba" /> There are no configuration parameters for this plugin
            </p>
        )}
      </React.Fragment>
    );
  }
}
const mapStateToProps = ({ plugin }: ApplicationState) => ({
  parameters: plugin.parameters
});
export default connect(
  mapStateToProps,
  null
)(PluginConfiguration);
