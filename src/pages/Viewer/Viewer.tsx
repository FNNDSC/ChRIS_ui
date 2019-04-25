import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { HomeIcon } from "@patternfly/react-icons";
import { ApplicationState } from "../../store/root/applicationState";
import { IPluginState } from "../../store/plugin/types";
import { getPluginFilesRequest } from "../../store/plugin/actions";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import AmiViewer from "../../components/dicomViewer/AmiViewer";
import "./viewer.scss";

interface IPropsFromDispatch {
  getPluginFilesRequest: typeof getPluginFilesRequest;
}
type AllProps = IPluginState & IPropsFromDispatch & RouteComponentProps;

class ViewerPage extends React.Component<AllProps> {
  constructor(props: AllProps) {
    super(props);
    const { getPluginFilesRequest } = this.props;
    !!selected && getPluginFilesRequest(selected); // Will change to be driven by match.params.id;
  }
  componentDidMount() {
    document.title = "Ami Viewer - ChRIS UI site";
  }

  render() {
    const { files } = this.props;
    return (
      <div className="ami-wrapper black-bg pf-u-p-lg">
        <h1 className="pf-u-mb-lg">
          <Link to={`/`} className="pf-u-mr-lg">
            <HomeIcon />
          </Link>
          Ami Viewer: {!!files ? `${files.length} files` : "no files were found"}
        </h1>
        {!!files && files.length ? (
          <AmiViewer files={files} />
        ) : (
          <div>No plugin instance selected</div>
        )}
      </div>
    );
  }
}

// HARDCODED SELECTED IPLUGINITEM ***** will be passed from UI ***** working
const selected = {
  compute_resource_identifier: "host",
  cpu_limit: 1000,
  descendants:  "",
  end_date: "2019-04-01T22:56:30.514702-04:00",
  feed_id: 1,
  gpu_limit: 0,
  id: 1,
  memory_limit: 200,
  number_of_workers: 1,
  pipeline_inst: null,
  plugin_id: 14,
  plugin_name: "mri10yr06mo01da_normal",
  previous: "",
  start_date: "2019-04-01T22:54:58.618135-04:00",
  status: "finishedSuccessfully",
  title: "",
  owner_username: "chris",
  feed: "http://fnndsc.childrens.harvard.edu:8001/api/v1/1/",
  files: "http://fnndsc.childrens.harvard.edu:8001/api/v1/plugins/instances/1/files/",
  parameters: "http://fnndsc.childrens.harvard.edu:8001/api/v1/plugins/instances/1/parameters/",
  plugin: "http://fnndsc.childrens.harvard.edu:8001/api/v1/plugins/14/",
  url: "http://fnndsc.childrens.harvard.edu:8001/api/v1/plugins/instances/1/"
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginFilesRequest: (item: IPluginItem) => dispatch(getPluginFilesRequest(item))
});

const mapStateToProps = ({ plugin }: ApplicationState) => ({
  files: plugin.files
  // selected: plugin.selected
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewerPage);
