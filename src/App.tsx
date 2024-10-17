import "@patternfly/react-core/dist/styles/base.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntdApp, theme } from "antd";
import { useContext } from "react";
import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
//@ts-ignore
import useAckee from "use-ackee";
import "./app.css";
import { ThemeContext } from "./components/DarkTheme/useTheme";
import "./components/Feeds/Feeds.css";
import type { EnhancedStore } from "@reduxjs/toolkit";
import Cart from "./components/NewLibrary/components/Cart";
import Routes from "./routes";
import type { RootState } from "./store/root/applicationState";

interface AllProps {
  store: EnhancedStore<RootState>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      refetchOnMount: false,
    },
  },
});

function App(props: AllProps) {
  const { isDarkTheme } = useContext(ThemeContext);
  const { store } = props;

  const ackeeEnvironment = {
    server: import.meta.env.VITE_ACKEE_SERVER,
    domainId: import.meta.env.VITE_ACKEE_DOMAIN_ID,
  };

  if (
    ackeeEnvironment.server &&
    ackeeEnvironment.server.length > 0 &&
    ackeeEnvironment.domainId
  ) {
    useAckee("/", ackeeEnvironment, {
      detailed: true,
      ignoreLocalhost: true,
      ignoreOwnVisits: true,
    });
  }

  return (
    <>
      <Provider store={store}>
        <CookiesProvider>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <ConfigProvider
                theme={{
                  algorithm: isDarkTheme
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
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
}

export default App;
