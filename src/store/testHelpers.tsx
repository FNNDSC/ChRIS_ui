/**
 * See https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function
 */
import { render, RenderOptions } from "@testing-library/react";
import { AppStore, setupStore } from "./configureStore.ts";
import { ApplicationState } from "./root/applicationState.ts";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "antd";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: ApplicationState;
  store?: AppStore;
}

/**
 * Wraps {@link render} for components which use redux and react-router.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {},
) {
  const {
    preloadedState,
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  } = extendedRenderOptions;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // default: true
        refetchOnMount: false,
        retry: false,
        staleTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: React.PropsWithChildren) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App>
          <MemoryRouter>{children}</MemoryRouter>
        </App>
      </QueryClientProvider>
    </Provider>
  );

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
