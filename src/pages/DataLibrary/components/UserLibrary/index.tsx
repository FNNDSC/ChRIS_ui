import React from "react";
import { Split, SplitItem } from "@patternfly/react-core";
import FeedsBrowser from "./FeedsBrowser";
import UploadsBrowser from "./UploadsBrowser";

export interface Paginated {
  hasNext: boolean;
  limit: number;
  offset: number;
}

const DataLibrary = () => {
  return (
    <>
      <section>
        <Split>
          <SplitItem>
            <h3>Recent Uploads</h3>
          </SplitItem>
          <SplitItem style={{ margin: "auto 1em" }} isFilled>
            <hr />
          </SplitItem>
        </Split>
        <UploadsBrowser />
      </section>

      <section>
        <Split>
          <SplitItem>
            <h3>Feed Files</h3>
          </SplitItem>
          <SplitItem style={{ margin: "auto 1em" }} isFilled>
            <hr />
          </SplitItem>
        </Split>
        <FeedsBrowser />
      </section>
    </>
  );
};

export default DataLibrary;
