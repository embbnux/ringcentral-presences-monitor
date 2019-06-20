import React from 'react';
import ReactDOM from 'react-dom';
import RingCentral from 'ringcentral';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

window.rcSDK = new RingCentral({
  server: process.env.REACT_APP_RINGCENTRAL_SERVER,
  appKey: process.env.REACT_APP_RINGCENTRAL_APP_CLIENT_ID,
  appSecret: process.env.REACT_APP_RINGCENTRAL_APP_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_RINGCENTRAL_REDIRECT_URI,
});
window.rcPlatform = window.rcSDK.platform();

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
