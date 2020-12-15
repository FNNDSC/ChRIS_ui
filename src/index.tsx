import React from "react";
import ReactDOM from "react-dom";
import { store } from "./store/configureStore";
import "./lib/fontawesome-config";
import Main from "./main";
import * as serviceWorker from "./serviceWorker";
import "antd/dist/antd.css";
import "./assets/scss/main.scss";


// Description: Set up store configurations

ReactDOM.render(<Main store={store} />, document.getElementById("root"));

serviceWorker.unregister();
