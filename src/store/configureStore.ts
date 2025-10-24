/*
 *   File:           configureStore.ts
 *   Description:    this is where the store comes together:
 *                   It contains the configureStore() => store, rootReducers, rootSagas, logger, and other middleware
 *   Author:         ChRIS UI
 */
import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import cartReducer from "./cart/cartSlice";
import pluginReducer from "./plugin/pluginSlice";
import pluginInstanceReducer from "./pluginInstance/pluginInstanceSlice";
import type { ApplicationState } from "./root/applicationState";
import { rootSaga } from "./root/rootSaga";

// TODO the example here accepts Partial<RootState>:
// https://redux.js.org/usage/writing-tests#example-app-code
// Figure out how we can also accept Partial<ApplicationState>?
export function setupStore(preloadedState?: ApplicationState) {
  // Build Saga middleware
  const sagaMiddleware = createSagaMiddleware();

  // Create store with Redux Toolkit's configureStore
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      plugin: pluginReducer,
      instance: pluginInstanceReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        serializableCheck: false, // Disable serializable check if necessary
      }).concat(logger, sagaMiddleware),
    devTools: import.meta.env.NODE_ENV !== "production",
    preloadedState,
  });

  // Run the root saga
  sagaMiddleware.run(rootSaga);

  return store;
}

// Export RootState type if needed elsewhere
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
