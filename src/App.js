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
import DeviceMenu from './components/DeviceMenu';

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

function App({ client }) {
  const classes = useStyles();
  const [ready, setReady] = useState(false);
  const [authState, setAuthState] = useStorage('authState', false);

  const [_, setSubscription] = useState(null);

  useEffect(() => {
    async function checkLogin() {
      const isLogined = await client.checkLogin()
      setAuthState(isLogined)
      if (isLogined) {
        const resetAuthState = () => {
          setAuthState(false);
        }
        client.platform.on(client.platform.events.refreshError, resetAuthState);
        const sub = await client.createSubscription(['/account/~/presence?detailedTelephonyState=true']);
        setSubscription(sub);
        setReady(true)
        return () => {
          client.platform.removeListener(client.platform.events.refreshError, resetAuthState);
        };
      }
      // Not login
      if (window.location.search.indexOf('code=') === -1) {
        setReady(true)
        return;
      }
      const loginResult = await client.loginFromCodeQuery();
      if (loginResult) {
        window.location.assign(process.env.REACT_APP_RINGCENTRAL_REDIRECT_URI);
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
          client.gotologinPage();
        }}
      />
    );
  } else {
    mainPage = (
      <HomePanel
        loadPresences={async () => {
          const data = await client.loadPresences();
          return data;
        }}
        superviseCall={async (call, extensionNumber) => {
          await client.superviseCall(call, extensionNumber);
        }}
        endCall={async (call) => {
          await client.endCall(call)
        }}
        subscription={client.subscription}
        ownerId={client.ownerId}
      />
    );
  }

  const logoutButton = authState ? (
    <Button
      color="inherit"
      onClick={() => {
        setAuthState(false);
        client.logout();
      }}
    >
      Logout
    </Button>
  ) : null;

  const deviceMenu = authState ? (
    <DeviceMenu
      loadDevices={async () => {
        const data = await client.loadDevices();
        return data
      }}
      onDeviceIdChanged={(id) => client.setDeviceId(id)}
      ownerId={client.ownerId}
    />
  ) : null;
  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            RingCentral Presences Monitor
          </Typography>
          {deviceMenu}
          {logoutButton}
        </Toolbar>
      </AppBar>
      {mainPage}
    </React.Fragment>
  );
}

export default App;
