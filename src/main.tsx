import { enableMapSet } from "immer";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeContextProvider } from "./components/DarkTheme/useTheme.tsx";
import { setupStore } from "./store/configureStore.ts";

import "@patternfly/react-core/dist/styles/base.css";

import "./main.css";

enableMapSet();
const store = setupStore();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <App store={store} />
    </ThemeContextProvider>
  </React.StrictMode>,
);
