import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Tooltip,
  Box,
  Stack,
  ButtonGroup,
  Avatar,
  } from '@mui/material';
import { Menu, LightMode, DarkMode, Search } from '@mui/icons-material';
import { changeTheme } from '../../store/actionMethods';
import './header.css';

const getThemeAndPicture = (state) => { return [state.theme, state.userId, state.profilePicture]};

const toggleMenuButton = {
  display: { xs: 'block', sm: 'none'},
};

const appBarStyle = {
  boxShadow: 0,
  borderBottom: 1,
  borderColor: 'border.main',
  zIndex: { sm: (theme) => theme.zIndex.drawer + 1 },
  backgroundColor: 'transparent',
  backdropFilter: 'blur(5px)',
};

// header Component
//
//
const Header = ({ toggle }) => {

  const [mode, userId, profilePicture] = useSelector(getThemeAndPicture);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleSearchClick = () => {
    navigate('/dashBoard/search');
  };

  return (
    <AppBar position="fixed" sx={appBarStyle}>
      <Toolbar className='toolbar' sx={{ padding: 0, margin: 0}}>
        {
          userId !== '' ?
          (
            <IconButton onClick={toggle} sx={toggleMenuButton}>
              <Menu />
            </IconButton>
          )
          : null
        }
        <Typography variant="h5" component="h5" ml="10px">Chat App</Typography>
        <Stack direction="row" justifySelf="flex-end">
          <ButtonGroup  className="buttonGroup">
            <Tooltip arrow title={ mode === 'light'? 'Dark mode':'Light mode'}>
              <IconButton onClick={ () => { dispatch(changeTheme()); } }>
                { mode === 'light' ? <DarkMode /> : <LightMode /> }
              </IconButton>
            </Tooltip>
            <Tooltip arrow title="Search for friends">
              <IconButton
                aria-label="search button for desktop"
                sx={{display: {xs: 'none', sm: 'block'}}}
                onClick={handleSearchClick}
              >
                <Search/>
              </IconButton>
            </Tooltip>
          </ButtonGroup>
          { profilePicture !== '' ? (
            <Box sx={{ pl: 1, pr: 1 }}>
              <Avatar
                width="40px"
                height="40px"
                alt="user's profile picture"
                src={profilePicture}
              />
            </Box>
          ) : null }
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;