import React from "react";
import ReactDOM from "react-dom";
import { store } from "./store/configureStore";
import Main from "./main";
import "./assets/scss/main.scss";
import * as ServiceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Main store={store} />
  </React.StrictMode>,
  document.getElementById("root")
);


ServiceWorker.register();
