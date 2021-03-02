import * as React from "react";
import Routes from "./routes";
import { Provider } from "react-redux";
import { Store } from "redux";
import { Router } from "react-router-dom";
import { RootState } from "./store/root/applicationState";
import history from "./utils";
import smoothScrollTop from "./utils/smoothScrollTop";

interface AllProps {
  store: Store<RootState>;
}

class Main extends React.Component<AllProps> {
  componentDidMount() {
    smoothScrollTop();
  }

  render() {
    const { store } = this.props;
   
    return (
      <Provider store={store}>
        <Router history={history}>
          <Routes />
        </Router>
      </Provider>
    );
  }
}

export default Main;
