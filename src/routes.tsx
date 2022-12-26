import React, { useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import { RouterContext, RouterProvider } from "./pages/Routing/RouterContext";
import { LogIn } from "./pages/LogIn/Login";
import { NotFoundPage as NotFound } from "./pages/NotFound/NotFound";
import Wrapper from "./pages/Layout/PageWrapper";
import Dashboard from "./pages/Dashboard/Dashboard";
import FeedsPage from "./pages/Feeds/Feeds";
import GalleryPage from "./pages/ViewImage/ViewImage";
import VisualizationPage from "./pages/VisualizationPage";
import Library, { Series } from "./pages/DataLibrary/Library";
import SignUp from "./pages/SignUp/SignUp";
import CatalogPage from "./pages/CatalogPage";
import PACSLookup from "./pages/DataLibrary/components/PACSLookup";
import PipelinePage from "./pages/Pipelines";
import ComputePage from "./pages/Compute";
import SinglePlugin from "./pages/SinglePluginPage/SinglePlugin";

interface IState {
  selectData?: Series;
}

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
  const [state, setState] = useState(State);
  const [route, setRoute] = useState<string>();
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
          <Wrapper>
            <RouterProvider
              {...{ actions, state, route, setRoute }}
              context={MainRouterContext}
            >
              <FeedsPage />
            </RouterProvider>
          </Wrapper>
        </PrivateRoute>
      ),
    },
    {
      path: "catalog",
      element: (
        <PrivateRoute>
          <CatalogPage />
        </PrivateRoute>
      ),
    },
    {
      path: "plugin/:pluginName",
      element: (
        <PrivateRoute>
          <SinglePlugin />
        </PrivateRoute>
      )
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
      path: "pacs",
      element: (
        <PrivateRoute>
          <PACSLookup />
        </PrivateRoute>
      ),
    },
    {
      path: "visualization",
      element: <VisualizationPage />,
    },

    {
      path: "pipelines",
      element: <PipelinePage />,
    },
    {
       path: "compute", 
       element: <ComputePage />
    },

    {
      path: "gallery",
      element: <GalleryPage />,
    },
    {
      path: "login",
      element: <LogIn />,
    },
    {
      path: "signup",
      element: <SignUp />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  {
    /*
    process.env.REACT_APP_ALPHA_FEATURES === "development" && (
      <>
        <Route path="/slicedrop" element={<SliceDropPage />} />
        <Route path="/medview" element={<MedviewPage />} />
        <Route path="/fetalmri" element={<FetalMri />} />
        <Route path="/brainbrowser" element={<BrainBrowser />} />
        <Route path="/collab" element={<Collab />} />
      </>
    );
    */
  }

  return element;
};

export default MainRouter;
