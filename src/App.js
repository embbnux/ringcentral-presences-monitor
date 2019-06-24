import React, { useEffect, useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import { makeStyles } from '@material-ui/core/styles';

import useStorage from './useStorage';

import LoginPanel from './components/LoginPanel';
import HomePanel from './components/HomePanel';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const createSubscription = async () => {
  const cacheKey = 'subscribeKey';
  const subscription = window.rcSDK.createSubscription();
  const cachedSubscriptionData = window.rcSDK.cache().getItem(cacheKey);
  if (cachedSubscriptionData) {
    try {
      subscription.setSubscription(cachedSubscriptionData); 
    } catch (e) {
      console.error('Cannot set subscription data', e);
    }
  } else {
    subscription.setEventFilters(['/account/~/presence?detailedTelephonyState=true']);
  }
  subscription.on([subscription.events.subscribeSuccess, subscription.events.renewSuccess], () => {
    window.rcSDK.cache().setItem(cacheKey, subscription.subscription());
  });
  try {
    await subscription.register();
  } catch (e) {
    console.error('Cannot register subscription', e);
  }
  return subscription;
};

function App() {
  const classes = useStyles();
  const [ready, setReady] = useState(false);
  const [authState, setAuthState] = useStorage('authState', false);

  const rcPlatform = window.rcPlatform;
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    async function checkLogin() {
      const isLogined = await rcPlatform.loggedIn()
      setAuthState(isLogined)
      if (isLogined) {
        const resetAuthState = () => {
          setAuthState(false);
        }
        rcPlatform.on(rcPlatform.events.refreshError, resetAuthState);
        const sub = await createSubscription();
        setSubscription(sub);
        setReady(true)
        return () => {
          rcPlatform.removeListener(rcPlatform.events.refreshError, resetAuthState);
        };
      }
      // Not login
      if (window.location.search.indexOf('code=') === -1) {
        setReady(true)
        return;
      }
      const loginOptions = window.rcPlatform.parseLoginRedirect(window.location.search);
      if (loginOptions.code) {
        await window.rcPlatform.login(loginOptions);
        window.location.assign('/');
      }
    }
    checkLogin();
  }, []);

  let mainPage = null;
  if (!ready) {
    mainPage = (<div className={classes.center}><CircularProgress /></div>);
  } else if (!authState) {
    mainPage = (
      <LoginPanel
        onLogin={() => {
          const loginUrl = window.rcPlatform.loginUrl();
          window.location.assign(loginUrl);
        }}
      />
    );
  } else {
    mainPage = (
      <HomePanel
        loadPresences={async () => {
          const response = await window.rcPlatform.get('/account/~/presence?detailedTelephonyState=true');
          const data = response.json();
          return data.records;
        }}
        superviseCall={async (call, extensionNumber) => {
          const devicesResponse = await window.rcPlatform.get('/account/~/extension/~/device');
          const devices = devicesResponse.json().records;
          const device = devices[0];
          if (!device) {
            return;
          }
          await window.rcPlatform.post(`/account/~/telephony/sessions/${call.telephonySessionId}/supervise`, {
            mode: 'Listen',
            extensionNumber,
            deviceId: device.id
          });
        }}
        endCall={async (call) => {
          await window.rcPlatform.delete(`/account/~/telephony/sessions/${call.telephonySessionId}`);
        }}
        subscription={subscription}
      />
    );
  }

  const logoutButton = authState ? (
    <Button
      color="inherit"
      onClick={() => {
        setAuthState(false);
        window.rcSDK.platform().logout();
      }}
    >
      Logout
    </Button>
  ) : null;

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            RingCentral Presences Monitor
          </Typography>
          {logoutButton}
        </Toolbar>
      </AppBar>
      {mainPage}
    </React.Fragment>
  );
}

export default App;
