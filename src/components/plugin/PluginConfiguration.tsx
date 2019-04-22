import * as React from "react";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { pf4UtilityStyles } from "../../lib/pf4-styleguides";

type AllProps = {
  parameters: any[];
};

const PluginConfiguration: React.FunctionComponent<AllProps> = (props: AllProps ) => {
  return (
    !!props.parameters && (
      <React.Fragment>
        {props.parameters.length > 0 ? (
          props.parameters.map((param: any) => {
            return (
              <div key={`param_${param.id}`}>
                <label>{param.param_name}:</label> {param.value}
              </div>
            );
          })
        ) : (
          <p className={`${pf4UtilityStyles.spacingStyles.mb_md}`}>
            <ExclamationCircleIcon color="#007bba" /> There are no configuration
            parameters for this plugin
          </p>
        )}
      </React.Fragment>
    )
  );
};

export default React.memo(PluginConfiguration);
