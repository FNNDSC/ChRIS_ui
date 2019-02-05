import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  Alert,
  AlertActionCloseButton
} from "@patternfly/react-core";
type AllProps = RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI Demo site";
  }

  render() {
    return (
      <div>
        <h1>Welcome to ChRIS UI Demo site's Dashboard</h1>
         <Alert
          aria-label="welcome wagon"
          variant="info"
          title="Welcome!"
          action={
            <AlertActionCloseButton
              onClose={() => {
                return true;
              }}
            />
          }
        >
         Welcome to ChRIS UI Demo site's Dashboard. <a href="#">This is a link.</a>
        </Alert> 
      </div>
    );
  }
}

export { DashboardPage as Dashboard };
