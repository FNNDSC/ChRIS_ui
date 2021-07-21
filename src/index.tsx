import React from "react";
import ReactDOM from "react-dom";
import { store } from "./store/configureStore";
import Main from "./main";
import * as serviceWorker from "./serviceWorker";
import "./assets/scss/main.scss";

ReactDOM.render(
  <React.StrictMode>
    <Main store={store} />
  </React.StrictMode>, 
  document.getElementById("root")
);

if (process.env.NODE_ENV === 'production')
  serviceWorker.register();
else
  serviceWorker.unregister();
