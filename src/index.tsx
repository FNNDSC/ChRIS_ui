import React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { createRoot } from "react-dom/client";
import { store } from "./store/configureStore";
import Main from "./main";
import "./assets/scss/main.scss";

import * as ServiceWorker from "./serviceWorker";
import { ToastContainer } from "react-toastify";
 const container = document.getElementById("root");
//@ts-ignore
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Main store={store} />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
   </React.StrictMode>
);


ServiceWorker.register();
