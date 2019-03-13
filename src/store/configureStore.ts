/*
 *   File:           configureStore.ts
 *   Description:    this is where the store comes together:
 *                   It contains the createStore() => store, rootReducers, rootSagas, logger and other middleware
 *   Author:         ChRIS UI
 */
import { Store, createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { routerMiddleware  } from "connected-react-router"; // `react-router-redux` is deprecated use `connected-react-router`
import { initialGlobalState, ApplicationState } from "./root/applicationState";
// import rootReducer from './root/rootReducer';
import createRootReducer from "./root/rootReducer";
import { rootSaga } from "./root/rootSaga";
import { History } from "history";

export default function configureStore(history: History): Store<ApplicationState> {
  // Custom redux logger
  const logger = createLogger({
    collapsed: true
  });

  // Build Saga middleware
  const sagaMiddleware = createSagaMiddleware();

  // Create store
  const store = createStore(
    // rootReducer,
    createRootReducer(history),
    initialGlobalState,
    applyMiddleware(
        sagaMiddleware,
        routerMiddleware(history),
        logger)
  );

  // Run the root saga
  sagaMiddleware.run(rootSaga);

  // Return the store object.
  return store;
}
