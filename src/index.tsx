import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import configureStore from "./store/configureStore";
import "./lib/fontawesome-config";
import Main from "./main";
import * as serviceWorker from "./serviceWorker";
import "./assets/scss/main.scss";


// Description: Set up store configurations
const history = createBrowserHistory();
const store = configureStore(history);
ReactDOM.render(
  <Main store={store} history={history} />,
  document.getElementById("root"));

serviceWorker.unregister();
