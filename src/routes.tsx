import React, { useState } from 'react'
import { Route } from 'react-router-dom'
import PrivateRoute from './components/common/PrivateRoute'
import { RouterContext, RouterProvider } from './pages/Routing/RouterContext'
import { LogIn } from './pages/LogIn/Login'
import { NotFoundPage as NotFound } from './pages/NotFound/NotFound'
import Dashboard from './pages/Dashboard/Dashboard'
import FeedsPage from './pages/Feeds/Feeds'
import GalleryPage from './pages/ViewImage/ViewImage'
import VisualizationPage from './pages/VisualizationPage'
import Library, { Series } from './pages/DataLibrary/Library'
import SignUp from './pages/SignUp/SignUp'
import CatalogPage from './pages/CatalogPage'
import SliceDropPage from './pages/VisualizationPage/SliceDropPage'
import MedviewPage from './pages/VisualizationPage/MedviewPage'
import FetalMri from './pages/VisualizationPage/FetalMri'
import Collab from './pages/VisualizationPage/Collab'
import BrainBrowser from './pages/VisualizationPage/BrainBrowser'
import PACSLookup from './pages/DataLibrary/components/PACSLookup'

interface IState {
  selectData?: Series
}

interface IActions {
  createFeedWithData: (data: Series) => void
  clearFeedData: () => void
}

export const [State, MainRouterContext] = RouterContext<IState, IActions>({
  state: {
    selectData: [] as Series,
  },
})

export const MainRouter: React.FC = () => {
  const [state, setState] = useState(State)
  const [route, setRoute] = useState<string>()

  const actions: IActions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData })
      setRoute('/feeds')
    },

    clearFeedData: () => {
      setState({ selectData: [] })
    },
  }

  return (
    <RouterProvider
      {...{ actions, state, route, setRoute }}
      context={MainRouterContext}
    >
      <PrivateRoute exact path="/" component={Dashboard} />
      <PrivateRoute exact path="/catalog" component={CatalogPage} />
      <Route exact path="/login" component={LogIn} />
      <Route exact path="/signup" component={SignUp} />
      <PrivateRoute path="/feeds" component={FeedsPage} />
      <PrivateRoute path="/library" component={Library} />
      <PrivateRoute path="/gallery" component={GalleryPage} />

      <PrivateRoute path="/visualization" component={VisualizationPage} />
      {process.env.REACT_APP_ALPHA_FEATURES === 'development' && (
        <>
          <PrivateRoute path="/slicedrop" component={SliceDropPage} />
          <PrivateRoute path="/medview" component={MedviewPage} />
          <PrivateRoute path="/fetalmri" component={FetalMri} />
          <PrivateRoute path="/brainbrowser" component={BrainBrowser} />
          <PrivateRoute path="/collab" component={Collab} />
        </>
      )}

      <PrivateRoute path="/pacs" component={PACSLookup} />
      <Route component={NotFound} />
    </RouterProvider>
  )
}

export default MainRouter
