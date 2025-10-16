import {
  genUUID,
  getState,
  type ThunkModuleToFunc,
  useThunk,
} from "@chhsiao1981/use-thunk";
import { useEffect, useState } from "react";
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
import * as DoUI from "./reducers/ui";
import { useAppSelector } from "./store/hooks";

type TDoUI = ThunkModuleToFunc<typeof DoUI>;

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

// Define the routes and their corresponding sidebar items
const _ROUTE_TO_SIDEBAR_ITEM: Record<string, string> = {
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

export default () => {
  const location = useLocation();
  const [state, setState] = useState(State);
  const [route, setRoute] = useState("");
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  const [uiID, _] = useState(genUUID());
  const useUI = useThunk<DoUI.State, TDoUI>(DoUI);
  const [stateUI, doUI] = useUI;

  console.info("routes: start: route:", route);

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

  const matchRoute = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

    // Exact match first
    if (_ROUTE_TO_SIDEBAR_ITEM[normalizedPath]) {
      return _ROUTE_TO_SIDEBAR_ITEM[normalizedPath];
    }

    // Wildcard match
    for (const routePath of Object.keys(_ROUTE_TO_SIDEBAR_ITEM)) {
      if (matchPath({ path: routePath, end: true }, path)) {
        return _ROUTE_TO_SIDEBAR_ITEM[routePath];
      }
    }

    // Default to notFound if no match
    return _ROUTE_TO_SIDEBAR_ITEM["*"];
  };

  useEffect(() => {
    doUI.init(uiID);
  }, []);

  // Update the active sidebar item based on the current route
  useEffect(() => {
    const currentPath = location.pathname;
    const sidebarItem = matchRoute(currentPath);
    doUI.setSidebarActive(uiID, sidebarItem);
  }, [location.pathname]);

  const ui = getState(stateUI, uiID) || DoUI.defaultState;

  return useRoutes([
    {
      path: "/",
      element: <Dashboard useUI={useUI} />,
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
              <GnomeLibrary useUI={useUI} />
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
            <FeedsListView title="My Data" isShared={false} useUI={useUI} />
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
            <FeedView useUI={useUI} />
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
            <FeedsListView title="Shared Data" isShared={true} useUI={useUI} />
          </OperationsProvider>
        </RouterProvider>
      ),
    },
    {
      path: "package/:id",
      element: <SinglePlugin useUI={useUI} />,
    },
    {
      path: "pacs",
      element: (
        <PrivateRoute>
          <Pacs useUI={useUI} />
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
      path: "package",
      element: <PipelinePage useUI={useUI} />,
    },
    {
      path: "compute",
      element: <ComputePage useUI={useUI} />,
    },
    {
      path: "import",
      element: <Store useUI={useUI} />,
    },
    {
      path: "*",
      element: <NotFound useUI={useUI} />,
    },
    {
      path: "install/*",
      element: <PluginInstall useUI={useUI} />,
    },
  ]);
};
