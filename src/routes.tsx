import React, { useEffect } from "react";
import { getRoot, useReducer } from "react-reducer-utils";
import {
  matchPath,
  useLocation,
  useNavigate,
  useRoutes,
} from "react-router-dom";
import ComputePage from "./components/ComputePage";
import Dashboard from "./components/Dashboard";
import DatasetRedirect from "./components/DatasetRedirect";
import FeedsListView from "./components/Feeds/FeedListView";
import FeedView from "./components/Feeds/FeedView";
import GnomeLibrary from "./components/GnomeLibrary";
import Login from "./components/Login";
import { OperationsProvider } from "./components/NewLibrary/context";
import Store from "./components/NewStore";
import NiivueDatasetViewerPage from "./components/NiivueDatasetViewer";
import NotFound from "./components/NotFound";
import Pacs from "./components/Pacs";
import PipelinePage from "./components/PipelinesPage";
import PluginInstall from "./components/PluginInstall";
import PrivateRoute from "./components/PrivateRoute";
import {
  RouterContext,
  RouterProvider,
} from "./components/Routing/RouterContext";
import Signup from "./components/Signup";
import SinglePlugin from "./components/SinglePlugin";
import * as DoPacs from "./reducers/pacs";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setSidebarActive } from "./store/ui/uiSlice";

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
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [state, setState] = React.useState(State);
  const [route, setRoute] = React.useState<string>();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const [statePacs, doPacs] = useReducer(DoPacs);

  const pacs = getRoot(statePacs) ?? DoPacs.defaultState;

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

  // Define the routes and their corresponding sidebar items
  const routeToSidebarItem: Record<string, string> = {
    "/": "overview",
    "library/*": "lib",
    "data/*": "data",
    "data/:id": "data",
    "shared/*": "shared",
    new: "new",
    pacs: "pacs",
    login: "login",
    signup: "signup",
    "package/*": "package",
    "package/:id": "package",
    import: "import",
    compose: "compose",
    "niivue/:plinstId": "niivue",
    store: "store",
    "install/*": "install",
    "*": "notFound",

    tag: "tag0",
    "tag/uploaded": "tag1",
    "tag/pacs": "tag2",
  };

  const matchRoute = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

    // Exact match first
    if (routeToSidebarItem[normalizedPath]) {
      return routeToSidebarItem[normalizedPath];
    }

    // Wildcard match
    for (const routePath of Object.keys(routeToSidebarItem)) {
      if (matchPath({ path: routePath, end: true }, path)) {
        return routeToSidebarItem[routePath];
      }
    }

    // Default to notFound if no match
    return routeToSidebarItem["*"];
  };

  // Update the active sidebar item based on the current route
  useEffect(() => {
    const currentPath = location.pathname;
    const sidebarItem = matchRoute(currentPath);
    dispatch(
      setSidebarActive({
        activeItem: sidebarItem,
      }),
    );
  }, [location.pathname, dispatch]);

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
            <OperationsProvider>
              <GnomeLibrary />
            </OperationsProvider>
          </RouterProvider>
        </PrivateRoute>
      ),
    },
    {
      path: "data/*",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="My Data" isShared={false} />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "data/:id",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedView />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "shared/*",
      element: (
        <RouterProvider
          {...{ actions, state, route, setRoute }}
          context={MainRouterContext}
        >
          <OperationsProvider>
            <FeedsListView title="Shared Data" isShared={true} />
          </OperationsProvider>
        </RouterProvider>
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
            <Pacs pacs={pacs} />
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
      path: "package",
      element: <PipelinePage />,
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
      path: "import",
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
