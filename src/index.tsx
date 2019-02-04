import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';

import './assets/scss/main.scss';
import Main from './views/main';
import * as serviceWorker from './serviceWorker';


// Set up store configurations
const store = configureStore();

ReactDOM.render(
  <Provider store={store} >
    <Main />
  </Provider>
  ,
  document.getElementById('root'));


// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();