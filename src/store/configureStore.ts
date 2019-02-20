/*
*   File:           configureStore.ts
*   Description:    this is where the store comes together:
*                   It contains the createStore() => store, rootReducers, rootSagas, logger and other middleware
*   Author:         ChRIS ui Demo
*/
import {  Store, createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { initialGlobalState, ApplicationState } from './root/applicationState';
import rootReducer from './root/rootReducer';
import { rootSaga } from './root/rootSaga';



export default function configureStore(): Store<ApplicationState> {
    // Custom redux logger
    const logger = createLogger({
        collapsed: true
    });

    // Build Saga middleware
    const sagaMiddleware = createSagaMiddleware();

    // Create store
    const store = createStore(
        rootReducer,
        initialGlobalState,
        applyMiddleware(sagaMiddleware, logger)
    );

    // Run the root saga
    sagaMiddleware.run(rootSaga);

    // Return the store object.
    return store;
}
