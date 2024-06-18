import * as React from "react";
import { useRoutes } from "react-router-dom";
import ComputePage from "./components/ComputePage";
import Dashboard from "./components/Dashboard";
import DatasetRedirect from "./components/DatasetRedirect";
import FeedsListView from "./components/Feeds/FeedListView";
import FeedView from "./components/Feeds/FeedView";
import LibraryCopyPage from "./components/LibraryCopy";
import LibrarySearch from "./components/LibrarySearch";
import Login from "./components/Login";
import NiivueDatasetViewerPage from "./components/NiivueDatasetViewer";
import NotFound from "./components/NotFound";
import Pacs from "./components/Pacs";
import PipelinePage from "./components/PipelinesPage";
import PluginCatalog from "./components/PluginCatalog/";
import PluginInstall from "./components/PluginInstall";
import PrivateRoute from "./components/PrivateRoute";
import Signup from "./components/Signup";
import SinglePlugin from "./components/SinglePlugin";
import Store from "./components/Store";

export const MainRouter: React.FC = () => {
  const element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "library/*",
      element: (
        <PrivateRoute>
          <LibraryCopyPage />
        </PrivateRoute>
      ),
    },
    {
      path: "librarysearch/*",
      element: (
        <PrivateRoute>
          <LibrarySearch />
        </PrivateRoute>
      ),
    },

    {
      path: "feeds/*",
      element: <FeedsListView />,
    },
    {
      path: "feeds/:id",
      element: <FeedView />,
    },
    {
      path: "plugin/:id",
      element: <SinglePlugin />,
    },
    {
      path: "pacs",
      element: (
        <PrivateRoute>
          <Pacs />
        </PrivateRoute>
      ),
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: <Signup />,
    },

    {
      path: "pipelines",
      element: (
        <PrivateRoute>
          <PipelinePage />
        </PrivateRoute>
      ),
    },
    {
      path: "catalog",
      element: <PluginCatalog />,
    },
    {
      path: "compute",
      element: <ComputePage />,
    },
    {
      path: "dataset/:feedName?",
      element: <DatasetRedirect />,
    },
    {
      path: "niivue/:plinstId",
      element: <NiivueDatasetViewerPage />,
    },
    {
      path: "store",
      element: <Store />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "install/*",
      element: <PluginInstall />,
    },
  ]);

  return element;
};

export default MainRouter;
