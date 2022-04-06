import React, { useState } from 'react';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  List,
  Tooltip,
  ButtonGroup,
  Box, 
  ListItemButton,
  Popover,
  ClickAwayListener,
  Collapse,
  Grow,
  ListItemText,
  Modal,
  Button,
} from '@mui/material';
import { 
  Chat,
  MoreVert,
  Delete,
  ArrowDropDown,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { changeActiveGroup, removeGroup, changeGroupMemberList } from '../../store/actionMethods';




const MenuPopper = ({ anchorEl, handleClose, openModal }) => {
  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      onClose={handleClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
    >
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}} onClick={openModal}>
            <Delete/>
            <Typography component="span" variant="poster">
              Delete
            </Typography>
          </ListItemButton>
        </ListItem>
      </List>
    </Popover>
  );
};


const MemberList = ({ members }) => {
  return (
    <List disablePadding sx={{ borderTop: '1px solid', borderColor: 'primaryColor.main', mt: '10px' }} >
      <ListItemText>Members: </ListItemText>
      { members !== undefined && members.length > 0 ?
      members.map((member, index) => (
        <Grow in={true} key={member.friendId}>
          <ListItem>
            <ListItemAvatar>
              <Avatar alt={member.friendName} src={member.profilePicture} sx={{ width: '30px', height: '30px' }}>
                {member.profilePicture === '' ? member.friendName.charAt(0) : null }
              </Avatar>
            </ListItemAvatar>
            <Typography variant="poster" component="span">
              {member.friendName}
            </Typography>
          </ListItem>
        </Grow>
      ))
      : (
        <Grow in={true}>
          <ListItem>
            <Typography variant="poster" fontSize="15px" width="100%">
              No members in this group!
            </Typography>
          </ListItem>
        </Grow>
      )
      }
    </List>
  );
};

const fetchMembers = async (userId, groupId) => {
  const response = await fetch(`/${userId}/groups/${groupId}/members`, {
    method: 'GET',
    accept: 'application/json',
  });


  if (!response.ok || response.status !== 200) throw new Error("response is not good");

  const res = await response.json();
  if (res.members === undefined) throw new Error("members is undefined");

  return res.members;
};

const GroupItem = ({ group, toggleChatBox, userId }) => {
  const { profilePic, groupName, members, _id } = group;
  const [ anchorEl, changeAnchorEl ] = useState(null);
  const [ openMemberList, toggleMemberList ] = useState(false);
  const [ isRemoveModalOpen, toggleModal ] = useState(false);
  const dispatch = useDispatch();

  const handleMenuClick = (e) => {
    changeAnchorEl(e.currentTarget);
  };

  const handleClose = (e) => {
    changeAnchorEl(null);
  }

  const handleChatClick = (e) => {
    // dispatch the event 
    dispatch(changeActiveGroup(_id));
    toggleChatBox();
  };

  const handleMemberDropDown = (e) => {
    // console.log("handleMemberDropDown")
    // fetch Members of the group
    fetchMembers(userId, _id)
    .then(members => {
      dispatch(changeGroupMemberList(_id, members));
      toggleMemberList(!openMemberList);
    })
    .catch((err) => {
      console.log(err);
    });
  };

  const closeMemberList = (e) => {
    // console.log('closememberList called');
    toggleMemberList(false);
  };

  const handleModalClose = () => {
    toggleModal(false);
  };

  const openModal = () => {
    toggleModal(true);
  };

  const handleDelete = () => {
    handleModalClose();
    fetch(`/${userId}/groups/${_id}/remove`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok && response.status === 200)
        dispatch(removeGroup(_id));
    })
    .catch(err => console.log(err));
  };

  return ( 
    <Collapse in={true} timeout="auto">
      <ListItem sx={{ justifyContent: "space-between" }}>
        <Modal
          open={isRemoveModalOpen}
          onClose={handleModalClose}
          color="primary"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-around"
            sx={{
              padding: "10px",
              maxWidth: "250px",
              height: "100px",
              backgroundColor: '#353b48',
              borderRadius: '10px'
            }}
          >
            <Box display='flex' flexDirection="row" justifyContent="center">
              <Typography sx={{ color: "#FFF" }}>Delete the group ?</Typography>
            </Box>
            <Box display="flex" flexDirection="row" justifyContent="flex-end">
              <Button size="small" variant="outlined" color="primaryColor" onClick={handleDelete}>
                <Typography sx={{ color: "primaryColor.main" }} fontSize="12px" >Remove</Typography>  
              </Button>
            </Box>
          </Box>
        </Modal>
        <Box
          display="grid"
          gridTemplateColumns="1fr"
          gridTemplateRows="auto auto"
          gridGap="5px"
          overflowY="scroll"
          sx={{
            width: "100%"
          }}
        >
          <Box
            width="100%"
            display="flex"
            flexDirection="row"
            flexWrap="nowrap"
            justifyContent="space-between"
          >
            <Box 
              grid
              display="flex"
              flexDirection="row"
              alignItems="center"
              flexWrap="nowrap"
            >
              <ListItemAvatar>
                <Avatar alt={groupName} src={profilePic}>{(profilePic === "" ? `${groupName.charAt(0)}` : '' )}</Avatar>
              </ListItemAvatar>
              <Typography component="span">{groupName}</Typography>
            </Box>
            <ButtonGroup>
              <Tooltip title="start converstion">
                <IconButton onClick={handleChatClick}>
                  <Chat />
                </IconButton>
              </Tooltip>
              <Tooltip title="Members">
                <IconButton onClick={handleMemberDropDown}>
                  <ArrowDropDown/>
                </IconButton>
              </Tooltip>
              <Tooltip title="menu">
                <IconButton onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
            <MenuPopper anchorEl={anchorEl} handleClose={handleClose} openModal={openModal}/>
          </Box>
          {openMemberList ?
            <ClickAwayListener onClickAway={closeMemberList}>
              <Box>
              {openMemberList ?
                  <MemberList members={members} />
                : null }
              </Box>
            </ClickAwayListener>
          : null}
        </Box>
      </ListItem>
    </Collapse>
  );
};

export default GroupItem;