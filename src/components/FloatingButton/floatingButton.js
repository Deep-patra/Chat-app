import React from 'react';
import { Fab, Badge } from '@mui/material';
import { Notifications } from '@mui/icons-material';

const FabStyle = {
  display: { xs: 'block', sm: 'none' },
  bgcolor: 'primaryColor.main',
  position: 'fixed',
  bottom: '80px',
  right: '30px',
  '&:hover': {
    bgcolor: 'primaryColor.main'
  },
};

const FloatingButton = () => {
  return (
    <Fab
      aria-label="add Friend or Group"
      onClick={() => console.log('Fab is clicked!')}
      sx={FabStyle}
    >
      <Badge color="error" badgeContent={1} max={10}>
        <Notifications sx={{ color: "#FFF" }} />
      </Badge>
    </Fab> 
  );
};

export default FloatingButton;