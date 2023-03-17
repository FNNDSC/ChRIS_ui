import React from "react";
import { Grid } from "@patternfly/react-core";

import { useDispatch } from "react-redux";

const FileBrowserViewer = () => {
  const dispatch = useDispatch();

  return (
    <Grid
      style={{
        height: "100%",
      }}
    ></Grid>
  );
};

export default FileBrowserViewer;
