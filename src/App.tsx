import "@patternfly/react-core/dist/styles/base.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";
import { useContext } from "react";
import { CookiesProvider } from "react-cookie";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Store } from "redux";
//@ts-ignore
import useAckee from "use-ackee";
import "./app.css";
import { ThemeContext } from "./components/DarkTheme/useTheme";
import "./components/Feeds/Feeds.css";
import Routes from "./routes";
import { RootState } from "./store/root/applicationState";

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
    domainId: import.meta.env.VITE_ACKEE_DOMAIN_ID,
  };

  if (ackeeEnvironment.server && ackeeEnvironment.domainId) {
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
