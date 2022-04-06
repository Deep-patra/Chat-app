import React, { useState } from 'react';
import {
  Box, 
  Avatar,
  Typography,
  ButtonGroup,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grow,
  Collapse,
  Divider,
} from '@mui/material';
import { useSelector } from 'react-redux';

const getUserInfo = (state) => {
  return [state.name, state.profilePicture, state.friends, state.groups];
};

const Item = ({ name, profilePicture, key}) => {
  return (
    <Grow key={key} in={true}>
      <ListItem>
        <ListItemAvatar>
          <Avatar
            alt={name}
            src={profilePicture}
            sx={{
              width: "40px",
              height: "40px",
            }}
          >
            { profilePicture === '' ? name.charAt(0) : null }
          </Avatar>
        </ListItemAvatar>
        <ListItemText>
          {name}
        </ListItemText>
      </ListItem>
    </Grow>
  );
};

const Profile = () => {
  const [openFriends, toggleFriends] = useState(true);
  const [openGroups, toggleGroups] = useState(false);
  const [name, profilePicture, friends, groups] = useSelector(getUserInfo);

  const handleFriendButton = () => {
    toggleGroups(false);
    toggleFriends(true);
  };

  const handleGroupButton = () => {
    toggleFriends(false);
    toggleGroups(true);
  };
  return (
    <Box
      minWidth={{ sm: "400px", md: "600px" }}
      maxWidth="100%"
      ml={{ sm: "10px" }}
      gridColumn="2 / span 6"
    >
      <Box
        display="flex"
        flexDirection={{
          sm: "row",
          xs: "column",
        }}
        justifyContent={{ sm: "space-between" }}
        alignItems="center"
      >
        <Avatar
          alt={name}
          src={profilePicture}
          sx={{
            width: "150px",
            height: "150px",
            mt: "10px"
          }}
        >
          {profilePicture === '' ? name.charAt(0) : null}
        </Avatar>
        <Box display="flex" flexDirection="column" flexWrap="nowrap">
          <Typography
            color="opposite"
            component="h4"
            variant="h4"
          >
            {name}
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
          >
            <Box display="flex" flexDirection="row" m="5px">
              <Typography color="opposite" component="p">
                {friends.length}
              </Typography>

              <Typography variant="poster" component="p" sx={{ ml: '10px' }}>
                Friends
              </Typography>
            </Box>

            <Box display="flex" flexDirection="row" m="5px">
              <Typography color="opposite" component="p">
                {groups.length}
              </Typography>

              <Typography variant="poster" component="p" sx={{ ml: "10px"}}>
                Groups
              </Typography>
            </Box>

          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "primaryColor.main",
          borderRadius: "5px",
          margin: "5px 10px",
          mt: "20px"
        }}
      >
          <Box>
            <ButtonGroup variant="outlined" color="primaryColor" aria-label="outlined button group">
              <Button
                variant="text"
                color="primaryColor"
                sx={{
                  color: (openFriends ? '#FFF' : 'primaryColor.main'),
                  backgroundColor: (openFriends ? 'primaryColor.main' : 'primary.main' ),
                  '&:hover': {
                    color: 'primaryColor.main'
                  }
                }}
                onClick={handleFriendButton}
              >
                Friends
              </Button>
              <Button
                variant="text"
                color="primaryColor"
                onClick={handleGroupButton}
                sx={{
                  color: (openGroups ? '#FFF' : 'primaryColor.main'),
                  backgroundColor: (openGroups ? 'primaryColor.main' : 'primary.main' ),
                  '&:hover': {
                    color: 'primaryColor.main'
                  }
                }}
              >
                Groups
              </Button>
            </ButtonGroup>
            <Divider
              sx={{ borderColor: "primaryColor.main" }}
            />
          </Box>
          <Box>
            <List sx={{ width: "100%" }}>
              <Collapse in={true}>
                {
                  openFriends ? 
                  (
                    friends.length > 0 ?
                    (
                      friends.map((friend, index) => (
                        <Item key={index} name={friend.friendName} profilePicture={friend.profilePicture} />
                      ))
                    )
                    : 
                    <ListItem>
                      <Typography variant="poster" sx={{ ml: "10px" }}>
                        No friends yet!
                      </Typography>
                    </ListItem>
                  )
                  : null
                }
                {
                  openGroups ?
                  (
                    groups.length > 0 ?
                    (
                      groups.map((group, index) => (
                        <Item key={index} name={group.groupName} profilePicture={group.profilePicture} />
                      ))
                    )
                    : 
                    <ListItem>
                      <Typography variant="poster" sx={{ ml: "10px" }}>
                        No groups yet!
                      </Typography>
                    </ListItem>
                  )
                  : null
                }
              </Collapse>
            </List>
          </Box>
        </Box>
    </Box>
  );
};

export default Profile;