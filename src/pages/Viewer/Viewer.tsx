import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RouteComponentProps } from "react-router-dom";
import { ApplicationState } from "../../store/root/applicationState";
import { IPluginState } from "../../store/plugin/types";
import {  getPluginFilesChrisRequest } from "../../store/plugin/actions";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import AmiViewer from "../../components/dicomViewer/AmiViewer";
import "./viewer.scss";

interface IPropsFromDispatch {
  getPluginFilesChrisRequest: typeof getPluginFilesChrisRequest;
}
type AllProps = IPluginState & IPropsFromDispatch & RouteComponentProps;

class ViewerPage extends React.Component<AllProps> {
  constructor(props: AllProps) {
    super(props);
    const { getPluginFilesChrisRequest } = this.props;
    getPluginFilesChrisRequest("1"); /// Will change to be driven by match.params.id;
  }
  componentDidMount() {
    document.title = "Ami Viewer - ChRIS UI site";
  }

  render() {
    const { files } = this.props;
    return (
      (!!files && files.length) && (
        <React.Fragment>
        <div className="ami-viewer black-bg pf-u-p-lg">
          <AmiViewer files={files} />
        </div>
        </React.Fragment>
      )
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginFilesChrisRequest: (id: string) =>
    dispatch(getPluginFilesChrisRequest(id))
});

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  files: plugin.files
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewerPage);
