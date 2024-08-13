/*
 *   File:           configureStore.ts
 *   Description:    this is where the store comes together:
 *                   It contains the configureStore() => store, rootReducers, rootSagas, logger, and other middleware
 *   Author:         ChRIS UI
 */
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import cartReducer from "./cart/cartSlice";
import drawerReducer from "./drawer/drawerSlice";
import explorerReducer from "./explorer/explorerSlice";
import feedReducer from "./feed/feedSlice";
import pluginReducer from "./plugin/pluginSlice";
import pluginInstanceReducer from "./pluginInstance/pluginInstanceSlice";
import resourceReducer from "./resources/resourceSlice";
import { rootSaga } from "./root/rootSaga";
import uiReducer from "./ui/uiSlice";
import userReducer from "./user/userSlice";

export const store = configureAppStore();

function configureAppStore() {
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
      resource: resourceReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false, // Disabling thunk since we're using sagas
        serializableCheck: false, // Disable serializable check if necessary
      }).concat(sagaMiddleware),
    devTools: import.meta.env.NODE_ENV !== "production",
  });

  // Run the root saga
  sagaMiddleware.run(rootSaga);

  return store;
}

// Export RootState type if needed elsewhere
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof configureAppStore>;
