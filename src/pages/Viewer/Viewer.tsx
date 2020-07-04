import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";
import { connect } from "react-redux";

import { HomeIcon } from "@patternfly/react-icons";
import { ApplicationState } from "../../store/root/applicationState";
import { IPluginState } from "../../store/plugin/types";

import { galleryItems } from "../../assets/temp/viewer_data";
import AmiViewer from "../../components/dicomViewer/AmiViewer";
import "./viewer.scss";
import { getSelectedFiles } from "../../store/plugin/selector";

type AllProps = IPluginState & RouteComponentProps;

class ViewerPage extends React.Component<AllProps> {
  // eslint-disable-next-line

  componentDidMount() {
    document.title = "Ami Viewer - ChRIS UI site";
  }

  render() {
    return (
      <div className="ami-wrapper black-bg pf-u-p-lg">
        <h1 className="pf-u-mb-lg">
          <Link to={`/`} className="pf-u-mr-lg">
            <HomeIcon />
          </Link>
          Ami Viewer:{" "}
          {!!galleryItems
            ? `${galleryItems.length} files`
            : "no files were found"}
        </h1>
        {!!galleryItems && galleryItems.length ? (
          <AmiViewer galleryItems={galleryItems} />
        ) : (
          <div>No plugin instance selected</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  files: getSelectedFiles(state),
  selected: state.feed.selected,
});

export default connect(mapStateToProps)(ViewerPage);
