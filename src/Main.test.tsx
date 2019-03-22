import React from 'react';
import ReactDOM from 'react-dom';
import Main from './main';
import {createBrowserHistory} from "history";
import configureStore from "./store/configureStore";

it('renders without crashing', () => {
  const div = document.createElement('div');
  const history = createBrowserHistory();
  const store = configureStore(history);
  ReactDOM.render(<Main store={store} history={history} />, div);
  ReactDOM.unmountComponentAtNode(div);
});