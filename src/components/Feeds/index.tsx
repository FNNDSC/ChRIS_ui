import * as React from "react";
import { Route, Routes } from "react-router-dom";
import FeedListView from "./FeedListView";
import FeedView from "./FeedView";
import WrapperConnect from "../Wrapper";
import "./Feeds.css";

const FeedsPage: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <WrapperConnect>
            <FeedListView />
          </WrapperConnect>
        }
      />
      <Route
        path={`:id`}
        element={
          <WrapperConnect>
            <FeedView />
          </WrapperConnect>
        }
      />
    </Routes>
  );
};

export default FeedsPage;
