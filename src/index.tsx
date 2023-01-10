import React from "react";
import { createRoot } from "react-dom/client";
import { store } from "./store/configureStore";
import Main from "./main";
import "./assets/scss/main.scss";

import * as ServiceWorker from "./serviceWorker";
const container = document.getElementById("root");
//@ts-ignore
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Main store={store} />
  </React.StrictMode>
);


ServiceWorker.register();
