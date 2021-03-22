import * as React from "react";
import Routes from "./routes";
import { Provider } from "react-redux";
import { Store } from "redux";
import { BrowserRouter } from "react-router-dom";
import { RootState } from "./store/root/applicationState";

import smoothScrollTop from "./utils/smoothScrollTop";

interface AllProps {
  store: Store<RootState>;
}

const Main: React.FC<AllProps> = (props: AllProps) => {
  React.useLayoutEffect(() => {
    smoothScrollTop();
  }, []);

  const { store } = props;

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </Provider>
  );
};

export default Main;
