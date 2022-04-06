import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Cancel,
  Add
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { changeSearchResult, changeFriendsList } from '../../store/actionMethods';
import StartWorker from '../Socket/socket';


const SearchItem = ({ result, friends, userId }) => {
  const { friendName, profilePicture, friendId } = result;
  const dispatch = useDispatch();
  
  let isFriend = false;
  // check if the item is already a friend or not
  if (friends.length > 0) {
    for(const item of friends) {
      if (item.friendId === friendId) isFriend = true;
    }
  }


  if (friendId === userId) isFriend = true;

  const handleAddButton = () => {
    fetch(`/${userId}/friends/addFriend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId }),
    })
    .then(response => {
      if (response.ok && response.status === 200) {
        const newFriends = friends.concat(result);
        dispatch(changeFriendsList(newFriends));
      }
    })
    .catch(err => console.log(err));
  };

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar src={profilePicture} alt={friendName}>
          {friendName.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText>
        <Typography variant="poster">{friendName}</Typography>
      </ListItemText>
      { !isFriend ? (
        <Tooltip title="Add person">
          <IconButton onClick={handleAddButton}>
            <Add/>
          </IconButton>
        </Tooltip>
      ) : null }
    </ListItem>
  );
};


const SearchBox = () => {
  const [value, changeValue] = useState('');
  const searchResults = useSelector(state => state.searchResults);
  const friends = useSelector(state => state.friends);
  const userId = useSelector(state => state.userId);
  const dispatch = useDispatch();

  
  const handleChange = (e) => {
    changeValue(e.target.value);

    if (value !== '') {
      StartWorker.handleSearchItem(value);
    }
  };

 
  const handleCancel = () => {
    if (value !== '') changeValue('');
  };


  const handleClick = (e) => {

    // if value is empty string return it
    if (value === '') return;

    // search the user
    fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      accept: 'application/json',
      body: JSON.stringify({ username: value }),
    })
    .then(response => response.json())
    .then(res => {
      const { results } = res;

      if (results === undefined) return;

      dispatch(changeSearchResult(results));
    })
    .catch(err => console.log(err));
  };


  return (
    <Box
      gridColumn="2 / span 8"
      ml={{ xs: '0px', sm: '20px', md: '50px' }}
      sx={{
        maxWidth: "800px",
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        m="5px"
        alignItems="center"
        width={{ sm: "100%" }}
        padding="0px 4px"
      >
        <TextField
          variant="standard"
          color="primaryColor"
          type="text"
          value={value}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">
              <Search />
            </InputAdornment>,
            endAdornment: <InputAdornment position="end">
              <IconButton onClick={handleCancel}>
                <Cancel />
              </IconButton>
            </InputAdornment>
          }}
          sx={{
            width: "100%",
            '& .MuiInput-root': {
              pb: "5px",
            },
          }}
        />
        <Button
          variant="contained"
          color="primaryColor"
          sx={{
            borderRadius: "50%",
            minWidth: "0px",
            width: "40px",
            height: "40px",
            ml:"5px"
          }}
          onClick={handleClick}
        >
          <Search sx={{ color: "#FFF" }} />
        </Button>
      </Box>
      <Box display="flex" flexDirection="column" flexWrap="nowrap">
          <List>
            { searchResults.length > 0 ? 
              ( searchResults.map((result, index) => 
                  <SearchItem result={result} key={index} userId={userId} friends={friends} />
                ))
            : null
            } 
            <ListItem sx={{ justifyContent: "center" }}>
              { searchResults.length === 0 && value !== "" ? 
                <Typography variant="poster"> No search result found !</Typography>
              :
                <Typography variant="poster">Type in the box to search !</Typography>
              }
            </ListItem>
          </List>
      </Box>
    </Box>
  );
};

export default SearchBox;
