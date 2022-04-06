import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  Box,
  Typography,
  Button,
} from '@mui/material';

const Logout = () => {
  const [isModalOpen, toggleModal] = useState(true);
  const navigate = useNavigate();

  const handleModalClose = () => {
    toggleModal(false);
  };

  const handleLogout = () => {
    fetch('/logout', {
      method: 'GET',
    })
    .then(response => {
      if (!response.ok && response.status !== 200)
        throw new Error('response is not ok');

      navigate('/login');
    })
    .catch(err => console.log(err));
  };
  return (
    <Modal
      open={isModalOpen}
      onClose={handleModalClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box 
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography>
          Are you sure you want to logout?
        </Typography>
        <Box alignSelf="flex-end">
          <Button size="small" onClick={handleLogout}>Logout</Button>
          <Button variant="text" size="small" onClick={handleModalClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Logout;
