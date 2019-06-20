import React from 'react';

import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  modalContent: {
    position: 'absolute',
    width: 800,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none',
  },
  table: {
    minWidth: 800,
  },
}));

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

function PresenceModal({ opened, presence, onClose }) {
  const [modalStyle] = React.useState(getModalStyle);
  const classes = useStyles();

  return (
    <Modal open={opened} onClose={onClose} >
      <div className={classes.modalContent} style={modalStyle}>
        <Typography variant="h6">
          {presence.extension && presence.extension.extensionNumber} | {presence.telephonyStatus}
        </Typography>
        <Typography variant="h6">
          Calls:
        </Typography>
        <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Direction</TableCell>
            <TableCell align="right">Telephony Status</TableCell>
            <TableCell align="right">From</TableCell>
            <TableCell align="right">To</TableCell>
            <TableCell align="right">Start Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {presence.activeCalls && presence.activeCalls.map(call => (
            <TableRow
              key={call.id}
            >
              <TableCell component="th" scope="row">
                {call.direction}
              </TableCell>
              <TableCell align="right">{call.telephonyStatus}</TableCell>
              <TableCell align="right">{call.from}</TableCell>
              <TableCell align="right">{call.to}</TableCell>
              <TableCell align="right">{call.startTime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </Modal>
  );
}

export default PresenceModal;
