import "@patternfly/react-core/dist/styles/base.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";
import { useContext, useState } from "react";
import { CookiesProvider } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Cart from "./components/NewLibrary/Cart";
//@ts-ignore
import useAckee from "use-ackee";
import "./app.css";
import { ThemeContext } from "./components/DarkTheme/useTheme";
import "./components/Feeds/Feeds.css";
import { LibraryProvider } from "./components/NewLibrary/context";
import {
  RouterContext,
  RouterProvider,
} from "./components/Routing/RouterContext";
import Routes from "./routes";
import { useTypedSelector } from "./store/hooks";

interface IState {
  selectData?: Series;
}

export type Series = string[];

interface IActions {
  createFeedWithData: (data: Series) => void;
  clearFeedData: () => void;
}

export const [State, MainRouterContext] = RouterContext<IState, IActions>({
  state: {
    selectData: [] as Series,
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      refetchOnMount: false,
    },
  },
});

function App() {
  const [state, setState] = useState(State);
  const [route, setRoute] = useState<string>();

  const navigate = useNavigate();
  const isLoggedIn = useTypedSelector((state) => state.user.isLoggedIn);
  const actions: IActions = {
    createFeedWithData: (selectData: Series) => {
      setState({ selectData });
      const type = isLoggedIn ? "private" : "public";
      navigate(
        `/feeds?search=&searchType=&page=${1}&perPage=${14}&type=${type}`,
      );
    },

    clearFeedData: () => {
      setState({ selectData: [] });
    },
  };
  const { isDarkTheme } = useContext(ThemeContext);
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
      <CookiesProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider
            theme={{
              algorithm: isDarkTheme
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
            }}
          >
            <RouterProvider
              {...{ actions, state, route, setRoute }}
              context={MainRouterContext}
            >
              <LibraryProvider>
                <Cart />
                <Routes />
              </LibraryProvider>
            </RouterProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </CookiesProvider>
    </>
  );
}

export default App;
