import { useContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Routes from "./routes";
import { ConfigProvider, theme } from "antd";
import { Store } from "redux";
import { Provider } from "react-redux";
import { CookiesProvider } from "react-cookie";
import { RootState } from "./store/root/applicationState";
import "@patternfly/react-core/dist/styles/base.css";
import "./app.css";
import { ThemeContext } from "./components/DarkTheme/useTheme";

interface AllProps {
  store: Store<RootState>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

function App(props: AllProps) {
  const { isDarkTheme } = useContext(ThemeContext);
  const { store } = props;

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
