import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import useStorage from '../../useStorage';

export default function DeviceMenu({ loadDevices, ownerId, onDeviceIdChanged }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useStorage(`${ownerId}-deviceId`, null);

  const initDevices = async () => {
    const devices = await loadDevices();
    const activeDevice = devices.filter(d => d.status === 'Online');
    setDevices(activeDevice);
    const currentDevice = activeDevice.find(d => d.id === deviceId);
    if (!currentDevice && activeDevice.length) {
      setDeviceId(activeDevice[0].id);
      onDeviceIdChanged(activeDevice[0].id)
    } else {
      onDeviceIdChanged(deviceId)
    }
  }

  useEffect(() => {
    initDevices();
  }, []);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const device = devices.find(d => d.id === deviceId);
  return (
    <>
      <Button color="inherit" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} title="Select devices">
        {(device && device.name) || 'Select device'}
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {
          devices.map(d =>
            <MenuItem
              key={d.id}
              onClick={() => {
                handleClose();
                setDeviceId(d.id);
                onDeviceIdChanged(d.id);
              }}
            >
              {d.name} - {d.computerName}
            </MenuItem>
          )
        }
      </Menu>
    </>
  );
}
