import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import PresenceModal from '../PresenceModal';

import useStorage from '../../useStorage';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650,
  },
  tr: {
    '&:hover': {
      background: "#f3f3f3",
      cursor: 'pointer',
     }
  }
}));

const DEFAULT_PRESENCES = [];

function Home({ loadPresences, subscription, superviseCall }) {
  const classes = useStyles();
  const [presences, setPresences] = useStorage('presencesData', DEFAULT_PRESENCES);
  const [presence, setPresence] = useState({});
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!subscription) {
      return;
    }
    const onNotification = (data) => {
      console.log(data);
      const newPresences = [].concat(presences);
      const presenseIndex = newPresences.findIndex((p) => p.extension.id === data.body.extensionId);
      if (presenseIndex > -1) {
        newPresences[presenseIndex] = {
          ...newPresences[presenseIndex],
          ...data.body,
          activeCalls: data.body.activeCalls && data.body.activeCalls.filter(c => c.telephonyStatus !== 'NoCall'),
        };
        setPresences(newPresences);
      }
      if (presence.extension && presence.extension.id === data.body.extensionId) {
        setPresence({
          ...presence,
          ...data.body,
        });
      }
    }
    subscription.on(subscription.events.notification, onNotification);
    return () => {
      subscription.removeListener(subscription.events.notification, onNotification)
    };
  }, [subscription, presences, presence]);

  useEffect(() => {
    async function initData() {
      if (presences === DEFAULT_PRESENCES) {
        const records = await loadPresences();
        setPresences(records);
      }
    }
    initData();
  }, [presences]);

  return (
    <Container maxWidth="md" component="main">
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Extension</TableCell>
            <TableCell align="right">Presence Status</TableCell>
            <TableCell align="right">Telephony Status</TableCell>
            <TableCell align="right">Dnd Status</TableCell>
            <TableCell align="right">Active Calls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {presences.map(row => (
            <TableRow
              key={row.extension.id}
              className={classes.tr}
              onClick={() => {
                setPresence(row);
                setOpened(true);
              }}
            >
              <TableCell component="th" scope="row">
                {row.extension.extensionNumber}
              </TableCell>
              <TableCell align="right">{row.presenceStatus}</TableCell>
              <TableCell align="right">{row.telephonyStatus}</TableCell>
              <TableCell align="right">{row.dndStatus}</TableCell>
              <TableCell align="right">{(row.activeCalls && row.activeCalls.length) || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PresenceModal
        opened={opened}
        onClose={() => { setOpened(false); }}
        presence={presence}
        superviseCall={superviseCall}
      />
    </Container>
  );
}

export default Home;
