import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { ConfigProvider, theme } from "antd";
import { Store } from "redux"
import { Provider } from "react-redux";
import { CookiesProvider } from "react-cookie";
import { RootState } from "./store/root/applicationState";
import "@patternfly/react-core/dist/styles/base.css";
import "./app.css";

interface AllProps {
  store: Store<RootState>;
}

function App(props: AllProps) {
  const { store } = props;
  return (
    <>
      <Provider store={store}>
        <CookiesProvider>
          <BrowserRouter>
            <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
              <Routes />
            </ConfigProvider>
          </BrowserRouter>
        </CookiesProvider>
      </Provider>
    </>
  );
}

export default App;
