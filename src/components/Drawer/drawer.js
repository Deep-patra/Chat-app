import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Drawer,
    SwipeableDrawer,
    Box,
    CssBaseline,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    List,
    Divider,
    Avatar,
    Badge,
    IconButton,
    Tooltip,
    Typography,
    TextField,
  } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AccountCircle, People, GroupAdd, Logout, Add, Search, Edit, CheckCircle } from '@mui/icons-material';
import { changeProfilePicture } from '../../store/actionMethods';

const Input = styled('input')({
  display: 'none',
});

const list = [
  { text: 'Profile', icon: <AccountCircle /> },
  { text: 'Search', icon: <Search /> },
  { text: 'Friends', icon: <People /> },
  { text: 'Groups', icon: <GroupAdd /> },
  { text: 'Logout', icon: <Logout /> },
];

const iconButtonStyle = {
  bgcolor: "border.main",
  padding: 0,
  '& :hover': {
    bgcolor: "border.main",
    borderRadius: "50%",
  },
};

const getBase64String = (file) => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const image = new Image();
  image.width = 200;
  image.height = 200;
  image.style.objectFit = "cover";

  image.onload = () => {
    canvas.width = 200;
    canvas.height = 200;
    ctx.drawImage(image, 0, 0, 200, 200);

    resolve(canvas.toDataURL('jpeg', 0.1));
  };

  image.onerror = (error) => {
    reject(error);
  };

  image.src = URL.createObjectURL(file);
});

const ChangeProfile = ({ userId }) => {
  const dispatch = useDispatch();

  const setImageAsProfilePicture = (image) => {
    dispatch(changeProfilePicture(image));
    fetch(`/${userId}/change_profile_picture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    })
    .then(response => {
      if (response.ok && response.status === 200)
        dispatch(changeProfilePicture(image));
    });
  }; 

  const handleFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    getBase64String(file)
      .then(image => setImageAsProfilePicture(image))
      .catch(err => console.log(err));

  };
  return (
    <Box>
      <label htmlFor="icon-button-file">
        <Input accept="image/*" id="icon-button-file" type="file" onChange={handleFileChange} />
        <Tooltip arrow title="Set a new Profile Picture">
          <IconButton sx={iconButtonStyle} aria-label="upload picture" component="span" >
            <Add sx={{ color: "#FFF" }} />
          </IconButton>
        </Tooltip>
      </label>
    </Box>
  );
};


const getNameAndPicture = (state) => {return [state.name, state.profilePicture]};

const ProfilePicture = ({ name, profilePicture, userId }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <ChangeProfile userId={userId} />
        }
      >
        <Avatar
          alt={name}
          src={profilePicture}
          sx={{ width: '120px', height: '120px', border: 3, borderColor: 'border.main' }}
        />
      </Badge>
    </Box>
  );
};

const NameDisplay = ({ name, userId }) => {
  const [inputOpen, toggle] = useState(false);
  const [value, changeValue] = useState(name);
  const dispatch = useDispatch();
  
  const handleInputChange = (e) => {
    changeValue(e.target.value);
  };
  
  const handleEditButton = (e) => {
    toggle(!inputOpen);
  };

  const handleSetName = (e) => {
    toggle(!inputOpen);
    if (value === '' || value === name) return;

    // send the new name
    fetch(`/${userId}/change_username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: value }),
    })
    .then(response => {
      if (response.ok && response.status === 200)
        dispatch({ type: "CHANGE_USERNAME", username: value });
    })
    .catch(err => console.log(err));
  };
  return (
    <Box 
      display="flex"
      flexDirection="row"
      justifyContent="space-around"
      alignItems="center"
      margin="0px auto"
    >
      { inputOpen ?
        <TextField
          value={value}
          onChange={handleInputChange}
          variant="standard"
          sx={{
            width: "100px"
          }}
        />
        : 
        <Typography variant="poster" component="span" fontWeight="bold">
          {name}
        </Typography>
      }
      {
        !inputOpen ?
        <IconButton onClick={handleEditButton}>
          <Edit/>
        </IconButton>
        :
        <IconButton onClick={handleSetName}>
          <CheckCircle/>
        </IconButton>
      }
    </Box>
  );
};

const NavList = ({ name, profilePicture }) => {
  const userId = useSelector(state => state.userId);
  return (
    <List>
      <ProfilePicture name={name} userId={userId} profilePicture={profilePicture} />
      <ListItem>
        <NameDisplay name={name} userId={userId} />
      </ListItem>
      { list.map((item, index) => (
        <Fragment key={index}>
          <ListItem sx={{ display: ( item.text === 'Search' ? { xs: "block", sm: "none" } : "block" )}}>
            <Link style={{ textDecoration: "none" }} to={`/dashboard/${item.text.toLowerCase()}`}>
              <ListItemButton>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText sx={{ color: 'opposite.main' }} primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
          <Divider />
        </Fragment>
      )) }
    </List>
  );
};


const permanentDrawerStyle = {
  display: { xs: 'none', sm: 'block' },
  '& .MuiPaper-root': {
    bgcolor: 'primary.main',
    position: 'relative',
  },
};

const Nav = ({ open, toggleMenu }) => {
  const [name, profilePicture] = useSelector(getNameAndPicture);

  return (
    <Box>
      <CssBaseline />
      <Drawer variant="permanent" sx={permanentDrawerStyle}>
        <NavList name={name} profilePicture={profilePicture} />
      </Drawer>
      <SwipeableDrawer
        anchor="left"
        open={open}
        onClose={toggleMenu}
        onOpen={toggleMenu}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: 'primary.main',
            pt: 4,
          }
        }}
      >
        <NavList name={name} profilePicture={profilePicture} />
      </SwipeableDrawer>
    </Box>
  );
};


export default Nav;
