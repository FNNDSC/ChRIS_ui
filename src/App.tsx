import { useContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//@ts-ignore
import useAckee from "use-ackee";
import Routes from "./routes";
import { ConfigProvider, theme } from "antd";
import { Store } from "redux";
import { Provider } from "react-redux";
import { CookiesProvider } from "react-cookie";
import { RootState } from "./store/root/applicationState";
import "@patternfly/react-core/dist/styles/base.css";
import "./app.css";
import "./components/Feeds/Feeds.css"
import { ThemeContext } from "./components/DarkTheme/useTheme";

interface AllProps {
  store: Store<RootState>;
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
    domainId: import.meta.env.VITE_ACKEE_DOMAIN_ID
  };

  if (ackeeEnvironment.server && ackeeEnvironment.domainId) {
    useAckee(
      "/",
      ackeeEnvironment,
      {
        detailed: true,
        ignoreLocalhost: true,
        ignoreOwnVisits: true,
      },
    );
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
                }}
              >
                <Routes />
              </ConfigProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </CookiesProvider>
      </Provider>
    </>
  );
}

export default App;
