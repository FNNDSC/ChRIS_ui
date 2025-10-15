import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { useContext } from "react";
import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
//@ts-ignore
import useAckee from "use-ackee";

import { ThemeContext } from "./components/DarkTheme/useTheme";
import "./components/Feeds/Feeds.css";
import type { EnhancedStore } from "@reduxjs/toolkit";
import Cart from "./components/NewLibrary/components/Cart";
import Routes from "./routes";
import type { RootState } from "./store/root/applicationState";

type Props = {
  store: EnhancedStore<RootState>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      refetchOnMount: false,
      networkMode: "always",
      refetchInterval: false,
    },
  },
});

export default (props: Props) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const { store } = props;

  /////
  // ackee
  /////
  const ackeeEnv = {
    server: import.meta.env.VITE_ACKEE_SERVER,
    domainId: import.meta.env.VITE_ACKEE_DOMAIN_ID,
  };

  if (ackeeEnv.server && ackeeEnv.server.length > 0 && ackeeEnv.domainId) {
    // biome-ignore lint/correctness/useHookAtTopLevel: useAckee depends on env, which is immutable.
    useAckee("/", ackeeEnv, {
      detailed: true,
      ignoreLocalhost: true,
      ignoreOwnVisits: true,
    });
  }

  // to render
  const themeAlg = isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <>
      <Provider store={store}>
        <CookiesProvider>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <ConfigProvider
                theme={{
                  algorithm: themeAlg,
                  token: {
                    // var(--pf-v5-global--primary-color--200)
                    colorSuccess: "#004080",
                  },
                  components: {
                    Progress: {
                      // var(--pf-v5-global--primary-color--100)
                      defaultColor: "#0066CC",
                    },
                  },
                }}
              >
                <AntdApp>
                  <div className="patternfly-font">
                    <Cart />
                    <Routes />
                  </div>
                </AntdApp>
              </ConfigProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </CookiesProvider>
      </Provider>
    </>
  );
};
