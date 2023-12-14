import * as React from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import NotFound from "./components/NotFound";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Pacs from "./components/Pacs";
import Dashboard from "./components/Dashboard";
import FeedsListView from "./components/Feeds/FeedListView";
import FeedView from "./components/Feeds/FeedView";
import PipelinePage from "./components/PipelinesPage";
import LibraryCopyPage from "./components/LibraryCopy";
import {
  RouterContext,
  RouterProvider,
} from "./components/Routing/RouterContext";
import PluginCatalog from "./components/PluginCatalog/";
import ComputePage from "./components/ComputePage";
import PrivateRoute from "./components/PrivateRoute";
import LibrarySearch from "./components/LibrarySearch";
import SinglePlugin from "./components/SinglePlugin";

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

  const actions: IActions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData });
      navigate("/feeds");
    },

    clearFeedData: () => {
      setState({ selectData: [] });
    },
  };

  const element = useRoutes([
    {
      path: "/",
      element: (
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      ),
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
          <LibrarySearch />
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
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <Pacs />
        </RouterProvider>
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
      element: <PipelinePage />,
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
      path: "*",
      element: <NotFound />,
    },
  ]);

  return element;
};

export default MainRouter;
