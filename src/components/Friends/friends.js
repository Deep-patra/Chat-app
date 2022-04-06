import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  List,
  IconButton,
  Typography,
  Tooltip,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Error, AddBox, CancelScheduleSend, People, } from '@mui/icons-material';
import { changeFriendsList , removeFriend } from '../../store/actionMethods';
import FriendItem from './friendItem';
import ChatBox from './chatBox.js';



// fetching friends list from the server
const fetchFriends = async (userId) => {
  const response = await fetch(`/${userId}/friends`, {
    method: 'GET',
    header: { 'Content-Type': 'application/json' },
    accept: 'application/json',
  })
  .catch( error => console.log(error));

  if (response === undefined) throw new Error ('response is invalid!');
  if (!response.ok) throw new Error('response is not ok');
  if (response.status !== 200) throw new Error('response status is not 200');

  const res = await response.json();
  if (res.friends === undefined) return [];
  return res.friends;
};

// funtion to get the friends list from the redux store
const getUserId = (state) => state.userId;


const FriendsBox = ({ toggleChatBox, handleClick }) => {

  let userId = useSelector(getUserId);
  const dispatch = useDispatch();
  let friends = useSelector(state => state.friends);
  const [ loading, changeLoadingStatus ] = useState(false);
  const [activeButtons, buttonClicked] = useState({
    friendsOpen: true,
    receivedRequest: false,
    sentRequests: false,
  });

  useEffect(() => {
    if ( Array.isArray(friends) && friends.length === 0 ) {

      // play the loading the animation
      changeLoadingStatus(true);
  
      fetchFriends(userId)
      .then(result => {
        const res = result.friends;
        dispatch(changeFriendsList(res));
        // stop the animation
        changeLoadingStatus(false);
      })
      .catch(err => {
        changeLoadingStatus(false);
      });
    }
  
  }, []);
  // console.log(friends);
  // for testing the component
  // comment this line in productions mode
  // friends = [{ name: "hello", profilePic: "" }];

  // handle the remove button 
  const handleRemoveButton = (friend) => {
    dispatch(removeFriend(friend));
  };


  return (
    <>
      <Box display="flex" flexDirection="row" flexWrap="nowrap" justifyContent="space-between">
          <Typography component="span" variant="poster" sx={{fontSize: '2rem'}}>Friends</Typography>
          <ButtonGroup variant="outlined" size="small" color="primaryColor" aria-label="outline button group">
            <Tooltip title="friends">
              <IconButton>
                <People sx={{color: (activeButtons.friendsOpen ? "primaryColor.main" : "opposite.main" )}} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Friend Requests">
              <IconButton>
                <AddBox sx={{color: (activeButtons.receivedRequest ? "primaryColor.main" : "opposite.main")}} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sent Requests">
              <IconButton>
                <CancelScheduleSend sx={{ color: (activeButtons.sentRequests ? "primaryColor.main" : "opposite.main" ) }}/>
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Box>
        {
          loading ?
            <Box display="flex" flexDirection="column" flexWrap="nowrap" alignItems="center" marginTop="100px">
              <CircularProgress sx={{ color: 'opposite.main' }} size="1.5rem" />
            </Box>
          : <List>
              { friends.length !== 0 && friends !== undefined ? [...friends].map((friend, index) => (
                <FriendItem friend={friend} handleRemove={handleRemoveButton} handleClick={handleClick} key={index} />
              )) : null }
            </List>
        }
        { !loading && friends.length === 0 ?
          <Box
            display="flex"
            flexDirection="column"
            flexWrap="nowrap"
            justifyContent="center"
            alignItems="center"
          >
            <Error sx={{ color: 'error.main' }} />
            <Typography variant="poster" component="span">No Friends yet!</Typography>
          </Box>
        : null
        }
    </>
  );
};


const Friends = () => {
  const [ isOpen, toggleChatBox ] = useState(false);

  const openChatBox = () => {
    toggleChatBox(true);
  };

  const closeChatBox = () => {
    toggleChatBox(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexWrap="nowrap"
      gridColumn={{
        sm: "2/ span 10",
        md: "2/ span 8",
      }}
      height="100%"
      maxWidth="800px"
      p={{ xs: "10px" }}
      pt={{ xs: "0px" }}
      pl={{ sm: "30px", md: "50px" }}
    >
      { !isOpen ? 
        <FriendsBox toggleChatBox={toggleChatBox} handleClick={openChatBox} /> :
        <ChatBox toggleChatBox={closeChatBox} />
      }
    </Box>
  );
};

export default Friends;