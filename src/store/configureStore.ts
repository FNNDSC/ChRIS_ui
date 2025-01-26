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
import drawerReducer from "./drawer/drawerSlice";
import explorerReducer from "./explorer/explorerSlice";
import feedReducer from "./feed/feedSlice";
import pluginReducer from "./plugin/pluginSlice";
import pluginInstanceReducer from "./pluginInstance/pluginInstanceSlice";
import uiReducer from "./ui/uiSlice";
import userReducer from "./user/userSlice";
import { rootSaga } from "./root/rootSaga";
import type { ApplicationState } from "./root/applicationState";

// TODO the example here accepts Partial<RootState>:
// https://redux.js.org/usage/writing-tests#example-app-code
// Figure out how we can also accept Partial<ApplicationState>?
export function setupStore(preloadedState?: ApplicationState) {
  // Build Saga middleware
  const sagaMiddleware = createSagaMiddleware();

  // Create store with Redux Toolkit's configureStore
  const store = configureStore({
    reducer: {
      user: userReducer,
      cart: cartReducer,
      drawers: drawerReducer,
      explorer: explorerReducer,
      feed: feedReducer,
      plugin: pluginReducer,
      instance: pluginInstanceReducer,
      ui: uiReducer,
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
