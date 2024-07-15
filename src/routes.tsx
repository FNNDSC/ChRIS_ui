import * as React from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import ComputePage from "./components/ComputePage";
import Dashboard from "./components/Dashboard";
import DatasetRedirect from "./components/DatasetRedirect";
import FeedsListView from "./components/Feeds/FeedListView";
import FeedView from "./components/Feeds/FeedView";
import LibraryCopyPage from "./components/NewLibrary";
import LibrarySearch from "./components/LibrarySearch";
import Login from "./components/Login";
import NiivueDatasetViewerPage from "./components/NiivueDatasetViewer";
import NotFound from "./components/NotFound";
import Pacs from "./components/Pacs";
import PipelinePage from "./components/PipelinesPage";
import PluginCatalog from "./components/PluginCatalog/";
import PluginInstall from "./components/PluginInstall";
import PrivateRoute from "./components/PrivateRoute";
import {
  RouterContext,
  RouterProvider,
} from "./components/Routing/RouterContext";
import Signup from "./components/Signup";
import SinglePlugin from "./components/SinglePlugin";
import Store from "./components/Store";
import { useTypedSelector } from "./store/hooks";

interface IState {
  selectData?: Series;
}

export type Series = any[];

interface IActions {
  createFeedWithData: (data: Series) => void;
  clearFeedData: () => void;
}

export const [State, MainRouterContext] = RouterContext<IState, IActions>({
  state: {
    selectData: [] as Series,
  },
});

export const MainRouter: React.FC = () => {
  const [state, setState] = React.useState(State);
  const [route, setRoute] = React.useState<string>();
  const navigate = useNavigate();
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);

  const actions: IActions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData });
      const type = isLoggedIn ? "private" : "public";
      navigate(
        `/feeds?search=&searchType=&page=${1}&perPage=${14}&type=${type}`,
      );
    },

    clearFeedData: () => {
      setState({ selectData: [] });
    },
  };

  const element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "library/*",
      element: (
        <PrivateRoute>
          <RouterProvider
            {...{ actions, state, route, setRoute }}
            context={MainRouterContext}
          >
            <LibraryCopyPage />
          </RouterProvider>
        </PrivateRoute>
      ),
    },
    {
      path: "librarysearch/*",
      element: (
        <PrivateRoute>
          <RouterProvider
            {...{ actions, state, route, setRoute }}
            context={MainRouterContext}
          >
            <LibrarySearch />
          </RouterProvider>
        </PrivateRoute>
      ),
    },

    {
      path: "feeds/*",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <FeedsListView />
        </RouterProvider>
      ),
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
          <RouterProvider
            {...{ actions, state, route, setRoute }}
            context={MainRouterContext}
          >
            <Pacs />
          </RouterProvider>
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
