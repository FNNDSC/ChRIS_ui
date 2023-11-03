import * as React from "react";
import { useRoutes } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Pacs from "./components/PacsCopy";
import Dashboard from "./components/Dashboard";
import FeedsPage from "./components/Feeds";
import { Results } from "./components/PacsCopy/components/PatientCard";
import PipelinePage from "./components/PipelinesPage";
import Library from "./components/Library/";
import { RouterContext } from "./components/Routing/RouterContext";
import PluginCatalog from "./components/PluginCatalog/";
import ComputePage from "./components/ComputePage";

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
  const element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "feeds/*",
      element: <FeedsPage />,
    },
    {
      path: "pacs",
      element: <Pacs />,
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
      element: <Library />,
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
  ]);

  return element;
};

export default MainRouter;
