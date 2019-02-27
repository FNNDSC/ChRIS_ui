import * as React from 'react';
import Routes from './routes';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { ApplicationState } from './store/root/applicationState';


interface AllProps {
  store: Store<ApplicationState>;
  history: History;
}

class Main extends React.Component<AllProps> {
  render() {
    const { store, history } = this.props;

    return (
      <Provider store={store}>
       <ConnectedRouter history={history}>
         <Routes />
       </ConnectedRouter>
      </Provider>
    );
  }
}

export default Main;
