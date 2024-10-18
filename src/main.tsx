import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { setupStore } from "./store/configureStore.ts";
import { ThemeContextProvider } from "./components/DarkTheme/useTheme.tsx";
import "@fontsource/inter/400.css"; // Defaults to weight 400.
import { enableMapSet } from "immer";

enableMapSet();
const store = setupStore();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <App store={store} />
    </ThemeContextProvider>
  </React.StrictMode>,
);
