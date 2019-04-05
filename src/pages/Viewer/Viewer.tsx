import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import AmiViewer from "../../components/viewer/displays/AmiViewer";
import "./viewer.scss";

type AllProps = RouteComponentProps;

class ViewerPage extends React.Component<AllProps> {
  constructor(props: AllProps) {
    super(props);
  }
  componentDidMount() {
    document.title = "Ami Viewer - ChRIS UI site";
  }
  state = {
    activeTabKey: 0 // Temp - set to 0
  };

  render() {
    const { children } = this.props;
    return (
      <div className="ami-viewer black-bg pf-u-p-lg">
        <AmiViewer files={[]} />
      </div>
    );
  }
}

export { ViewerPage as AmiViewer };
