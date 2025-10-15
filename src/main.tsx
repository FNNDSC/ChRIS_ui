import { enableMapSet } from "immer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeContextProvider } from "./components/DarkTheme/useTheme.tsx";
import { setupStore } from "./store/configureStore.ts";

import "@patternfly/react-core/dist/styles/base.css";

import "./main.css";

enableMapSet();
const store = setupStore();
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <ThemeContextProvider>
      <App store={store} />
    </ThemeContextProvider>
  </StrictMode>,
);
