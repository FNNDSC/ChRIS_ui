import * as React from "react";
import Routes from "./routes";
import RouterContext from "./pages/Routing/RouterContext";
import { Series } from "./pages/DataLibrary/Library";
import { Provider } from "react-redux";
import { Store } from "redux";
import { BrowserRouter } from "react-router-dom";
import { RootState } from "./store/root/applicationState";
import { CookiesProvider } from "react-cookie";


interface AllProps {
  store: Store<RootState>;
}

interface IState {
  selectData?: Series;
}

interface IActions {
  createFeedWithData: (data: Series) => void;
  clearFeedData: () => void;
}

export const [State, MainRouterContext] = RouterContext<IState, IActions>({
  state: {
    selectData: [] as Series,
  },
});

const Main: React.FC<AllProps> = (props: AllProps) => {
  const { store } = props;

  return (
    <Provider store={store}>
      <CookiesProvider>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </CookiesProvider>
    </Provider>
  );
};

export default Main;
