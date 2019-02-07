import * as React from 'react';
import Routes from './routes';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import Wrapper from './containers/layout/PageWrapper';
import { ApplicationState } from './store/root/applicationState';


interface AllProps {
  store: Store<ApplicationState>
}

class Main extends React.Component<AllProps> {
  public render() {
    const { store } = this.props;

    return (
      <Provider store={store}>
          <Routes />
      </Provider>
    );
  }
}

export default Main;
