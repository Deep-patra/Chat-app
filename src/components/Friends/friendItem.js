import React, { useState, Fragment } from 'react';
import { 
  ListItem,
  ListItemAvatar,
  Avatar,
  ButtonGroup,
  ListItemText,
  IconButton,
  Typography,
  Popover,
  Tooltip,
  Divider,
  Button,
 } from "@mui/material";
import { 
  MoreVert,
  Chat,
  Delete,
 } from "@mui/icons-material";
 import { useDispatch } from 'react-redux';
 import { changeActiveFriend } from '../../store/actionMethods';


const FriendItem = ({ friend, handleRemove, handleClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { friendName, friendId, profilePicture } = friend;
  const dispatch = useDispatch();

  const handleMenuButton = (e) => {
    setAnchorEl(e.currentTarget)
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveButton = () => {
    handleRemove(friend);
    setAnchorEl(null);
  };

  const handleChatClick = (e) => {
    dispatch(changeActiveFriend(friendId));
    handleClick();
  };

  const isOpen = Boolean(anchorEl);
  return (
    <Fragment key={friendName} >
      <ListItem disablePadding sx={{ pb: 1, pt: 1}} >
        <ListItemAvatar>
          <Avatar alt={friendName} src={profilePicture}>{profilePicture === '' ? friendName.charAt(0) : null}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Fragment>
              <Typography
                component="span"
              >
                {friendName}
              </Typography>
            </Fragment>
          }
        />
      <ButtonGroup variant="outlined">
        <Tooltip title="start conversation">
          <IconButton onClick={handleChatClick}>
            <Chat sx={{ color: "primaryColor.main" }} />
          </IconButton>
        </Tooltip>
        <IconButton onClick={handleMenuButton}>
          <MoreVert sx={{ color: "opposite.main" }} />
        </IconButton>
        <Popover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Button
            variant="text"
            onClick={handleRemoveButton}
            color="opposite"
            sx={{ fontSize: '0.7rem' }}
          >
            <Delete sx={{ color: "error.main" }} fontSize="small" />
            Remove
          </Button>
        </Popover>
      </ButtonGroup>
      </ListItem>
      <Divider/>
    </Fragment>
  );
};

export default FriendItem;