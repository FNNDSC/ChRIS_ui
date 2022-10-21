/*
 *   File:           configureStore.ts
 *   Description:    this is where the store comes together:
 *                   It contains the createStore() => store, rootReducers, rootSagas, logger and other middleware
 *   Author:         ChRIS UI
 */
import { Store, createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { RootState } from "./root/applicationState";
import rootReducer from "./root/rootReducer";
import { rootSaga } from "./root/rootSaga";
import { composeWithDevTools } from "redux-devtools-extension";

export const store = configureStore();

function configureStore(): Store<RootState> {
  // Custom redux logger
  const logger = createLogger({
    collapsed: true,
  });

  // Build Saga middleware
  const sagaMiddleware = createSagaMiddleware();
  
  // Build ALL Middleware
  let middleware;
  if (process.env.NODE_ENV !== "production") {
    middleware = applyMiddleware(sagaMiddleware, logger);
  } else {
    middleware = applyMiddleware(sagaMiddleware);
  }

  

  // Create store
  const store = createStore(rootReducer, {}, composeWithDevTools(middleware));

  // Run the root saga
  sagaMiddleware.run(rootSaga);

  // Return the store object.
  return store;
}
