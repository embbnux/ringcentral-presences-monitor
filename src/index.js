import React from 'react';
import ReactDOM from 'react-dom';
import RingCentral from 'ringcentral';
import RingCentralClient from './RingCentralClient';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const rcSDK = new RingCentral({
  server: process.env.REACT_APP_RINGCENTRAL_SERVER,
  appKey: process.env.REACT_APP_RINGCENTRAL_APP_CLIENT_ID,
  appSecret: process.env.REACT_APP_RINGCENTRAL_APP_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_RINGCENTRAL_REDIRECT_URI,
});
window.ringcentralClient = new RingCentralClient(rcSDK);

ReactDOM.render(<App client={window.ringcentralClient} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
