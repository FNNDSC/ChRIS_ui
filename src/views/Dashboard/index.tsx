import * as React from "react";
import { RouteComponentProps } from "react-router-dom";

type AllProps =  RouteComponentProps;

class DashboardPage extends React.Component<AllProps> {
  componentDidMount() {
    document.title = "Dashboard - ChRIS UI Demo site";
  }

  render() {
    return (
      <h1>Welcome to ChRIS UI Demo site's Dashboard</h1>
    );
  }
}

export { DashboardPage as Dashboard };
