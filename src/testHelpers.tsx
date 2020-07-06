import React from "react";
import { createMemoryHistory, MemoryHistory } from "history";
import { render, RenderResult } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "./store/configureStore";
import { Router } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import { createMemoryHistory } from "history";

const history = createMemoryHistory();

/**
 * Helper method to render components with the Router
 */

type RenderWithRouter = (
  renderComponent: () => React.ReactNode,
  route?: string
) => RenderResult & { history: MemoryHistory };

declare global {
  namespace NodeJS {
    interface Global {
      renderWithRouter: RenderWithRouter;
    }
  }

  namespace globalThis {
    const renderWithRouter: RenderWithRouter;
  }
}

//This function creates a history object and pushes the
// route to it through arguments

global.renderWithRouter = (renderComponent, route) => {
  const history = createMemoryHistory();
  if (route) {
    history.push(route);
  }
  return {
    ...render(<Router history={history}>{renderComponent()}</Router>),
    history,
  };
};

export const withProvider = <P extends object>(
  Component: React.ComponentType<P>
) => (props: P) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Component {...props} />
    </ConnectedRouter>
  </Provider>
);
