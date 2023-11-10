import * as React from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import NotFound from "./components/NotFound";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Pacs from "./components/Pacs";
import Dashboard from "./components/Dashboard";
import FeedsPage from "./components/Feeds";
import PipelinePage from "./components/PipelinesPage";
import Library from "./components/Library/";
import {
  RouterContext,
  RouterProvider,
} from "./components/Routing/RouterContext";
import PluginCatalog from "./components/PluginCatalog/";
import ComputePage from "./components/ComputePage";
import PrivateRoute from "./components/PrivateRoute";
import SinglePlugin from "./components/SinglePlugin";

interface IState {
  selectData?: Series;
}

export type Series = File[];

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
      path: "feeds/*",
      element: (
        <PrivateRoute>
          <RouterProvider
            {...{ actions, state, route, setRoute }}
            context={MainRouterContext}
          >
            <FeedsPage />
          </RouterProvider>
        </PrivateRoute>
      ),
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
      path: "library",
      element: (
        <PrivateRoute>
          <RouterProvider
            {...{ actions, state, route, setRoute }}
            context={MainRouterContext}
          >
            <Library />
          </RouterProvider>
        </PrivateRoute>
      ),
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
