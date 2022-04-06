import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { 
  Box,
  TextField,
  IconButton,
  Button,
  Avatar,
  InputAdornment,
  Typography,
  Grow,
} from '@mui/material';
import {
  Send,
  AddPhotoAlternate,
  Download,
  ArrowBack,
 } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { addMessage, addMessageList } from '../../store/actionMethods';
import StartWorker from '../Socket/socket';

const MessageBox = styled(Box)(({ theme }) => ({
  border: "solid 2px",
  borderColor: theme.palette.primaryColor.main,
  minWidth: "100px",
  borderRadius: "10px",
  marginLeft: "5px",
  padding: "5px",
  display: "grid",
  gridTemplateRows: "minmax(20px, auto) auto minmax(10px, auto)",
  gridTemplateColumns: "1fr",
  gridRowGap: "4px",
}));

const ImageList = ({ images }) => {
  return (
    <Box minWidth="200px" m="0" disablePadding>
      { images !== undefined ? images.map((image, index) => (
        <Box key={index} minWidth="200px" maxWidth="250px" disablePadding position="relative">
          <img alt="" src={image} width="100%" height="100%" style={{ objectFit: "contain" }} />
          <a
            download="image.jpeg"
            href={image}
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
            }}
          >
            <Download 
              sx={{
                border: "1px solid",
                borderColor: "primaryColor.main",
                backgroundColor: "#fff",
                borderRadius: "50%",
              }}
            />
          </a>
        </Box> 
      )) : null }
    </Box>
  );
}; 


const Message = ({ message, user, friend }) => {
  const { authorId, text, images, time } = message;
  return (
    <Grow in={true}>
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="nowrap"
        marginY="5px"
        maxWidth="400px"
      >
        <Avatar
          alt={""}
          src={user.userId === authorId ? user.profilePicture : friend.profilePicture }
          sx={(theme) => ({
            width: "40px",
            height: "40px",
          })}
        >
          { user.userId === authorId ? user.name.charAt(0) : friend.friendName.charAt(0) }
        </Avatar>
        <MessageBox>
          <Typography sx={(theme) => ({ color : (theme.palette.mode === 'light' ? 'primaryColor.main' : '#fff') })}>{authorId === user.userId ? user.name : friend.friendName }</Typography>
          {images !== undefined && images.length !== 0 ?
            <ImageList images={images} />
            : null }
          {text !== undefined && text !== '' ?
            <Typography>{text}</Typography>
            : null}
          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            <Typography sx={{ color: "primaryColor.main" }} fontSize="10px" component="span" >{time}</Typography>
          </Box>
        </MessageBox>
      </Box>
    </Grow>
  );
};


// convert the input files to blob for preview
const convertImage = (files, changeFile) => {
  // console.log(files);
  if (files.length > 0) {
    const fileList = [];
    for (const file of files) {
      fileList.push(URL.createObjectURL(file));
      // console.log(fileList)
    }

    changeFile([...fileList]);
  }
};

const getBase64String = (file) => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();

  img.onload = () => {
    canvas.width = 200;
    canvas.height = 200;

    ctx.drawImage(img, 0, 0, 200, 200);

    const image = canvas.toDataURL('jpeg', 0.5);
    resolve(image);
  };

  img.onerror = (error) => {
    reject(error);
  };

  img.src = URL.createObjectURL(file);
});

const convertImageToBase64 = async (files) => {
  const base64Files = [];
  if (files.length === 1 && files[0].name === "a.txt") return [];
  if (files.length > 0) {
    for (const file of files) {
      base64Files.push(await getBase64String(file));
    }
  }
  return base64Files;
}



const TypingBox = ({ userId, friendId }) => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const [ value, changeValue ] = useState('');
  const [ files, changeFile ] =useState([]);

  const handleInputChange = (e) => {
    changeValue(e.target.value);
  };

  const handleSendButton = async () => {
    if (value !== "" || files.length > 0) {
      console.log(inputRef.current.files);
      const imageFiles = await convertImageToBase64(inputRef.current.files);
      console.log(imageFiles);
      dispatch(addMessage({
        authorId: userId,
        text: value || '',
        images: imageFiles || [],
        time: `${new Date().toLocaleTimeString()}`,
      }));

      // sending the message from the websocket
      StartWorker.handleAddMessage(friendId, value, imageFiles);
      
      // reset the values and the files in the state
      changeValue('');
      changeFile([]);
      // reseting the files property in input element
      const dt = new DataTransfer();
      dt.items.add(new File([], 'a.txt'));
      inputRef.current.files = dt.files;
    }
  };

  const handleFileChange = (e) => {
    convertImage(e.target.files, changeFile);
  };

  useEffect(() => {

    const input = inputRef.current;

    input.addEventListener("change", handleFileChange);
    return () => {
      input.removeEventListener("change", handleFileChange);
    };
  }, [inputRef]);

  return (
    <Box display="flex" flexDirection="row" flexWrap="nowrap">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        style={{ display: "none" }}
      />
      <TextField
        variant="outlined"
        type="text"
        value={value}
        placeholder="Type Something..."
        onChange={handleInputChange}
        autoFocus
        color="primaryColor"
        sx={{ width: "100%" }}
        InputProps={{
          endAdornment: <InputAdornment position="end">
            <IconButton onClick={() => {inputRef.current.click();}}>
              <AddPhotoAlternate sx={{ color: "primaryColor.main" }} />
            </IconButton>
          </InputAdornment>
        }}
      />
      <Button variant="contained" color="primaryColor" onClick={handleSendButton}>
        <Send sx={{color: "#fff"}} />
      </Button>
    </Box>
  );
};

const getActiveFriend = (state) => state.activeFriendId;

const ChatBox = ({ toggleChatBox }) => {

  const messageBoxRef = useRef(null);
  const messageContainerRef = useRef(null);
  const dispatch = useDispatch();

  const friendId = useSelector(getActiveFriend);
  const { friends, messageList } = useSelector((state) => (
    {
      friends: state.friends,
      messageList: state.messages
    }));

  const friend = friends.find((item) => friendId === item.friendId );
  const { friendName, profilePicture } = friend;
  // console.log(friendId, friends, friend);
  // console.log(messageList);
  const item = messageList.find((item) => item.friendId === friendId);

  let messages = [];
  if (item !== undefined && item.messages !== undefined) messages = item.messages;

  // storing the user info in an object
  const user = useSelector((state) => (
    { name: state.name, profilePicture: state.profilePicture, userId: state.userId }
  ));


  useEffect(() => {

    const fetchMessages = () => {
       // fetch the messages
      fetch(`/${user.userId}/friends/${friendId}/messages`, {
        method: 'GET',
        accept: 'application/json',
      })
      .then(response => {
        if (!response.ok || response.status !== 200)
          throw new Error('response is not ok');
        return response;
      })
      .then(response => response.json())
      .then(res => {
        const { messages } = res;

        if (messages === undefined)
          throw new Error('response is not undefined');

          
        // dispatch the messages to the store
        dispatch(addMessageList(friendId, messages));
      })
    };

    fetchMessages();
   
  }, []);


  useEffect(() => {
    const container = messageContainerRef.current.getBoundingClientRect();
    messageBoxRef.current.scroll({
      top: container.height,
      left: 0,
      behavior: "smooth",
    });
  }, [messages.length]);

  return (
    <Box
      display="grid"
      gridTemplateRows="[line1] 50px [line2] calc(100vh - 205px) [line3] 60px [line4]"
      gridTemplateColumns="1fr"
      width={{ xs: "100%" }}
      sx={{ gridGap: "10px" }}
      height="100%"
      disablePadding
    >
      <Box
        gridRow="line1/line2"
        display="flex"
        flexDirection="row"
        flexWrap="nowrap"
        borderBottom="1px solid"
        borderColor="opposite.main"
        pb="5px"
        pt="2px"
        alignItems="center"
      >
        <IconButton onClick={toggleChatBox}>
          <ArrowBack color="primaryColor" />
        </IconButton>
        <Box display="flex" flexDirection="row">
          <Avatar src={profilePicture} sx={{ width: "30px", height: "30px" }} />
          <Typography sx={{ color: "opposite.main", fontSize: "1.3rem", marginLeft: "20px" }} component="span">{friendName}</Typography>
        </Box>
      </Box>
      <Box
        gridRow="line2/line3"
        ref={messageBoxRef}
        minHeight="200px"

        sx={{
          overflowY: "scroll",
          '&::-webkit-scrollbar': {
            bgcolor: "primary.main",
            width: "5px",
            height: "5px",
          },
          '&::-webkit-scrollbar-thumb': {
            maxWidth: "5px",
            bgcolor: "opposite.main",
            borderRadius: "8px",
            '&:hover': {
              bgcolor: "primaryColor.main"
            },
          }
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          flexWrap="nowrap"
          ref={messageContainerRef}
        >
          {
            messages.map((message, index) => (
            <Message
              key={index}
              message={message}
              friend={friend}
              user={user}
            />
          ))}
          { messages.length === 0 ? 
            <Box display="flex" justifyContent="center" alignItems="center">
              <Typography variant="poster"> No conversation yet! </Typography>
            </Box>
          : null }
        </Box>
      </Box>
      <Box
        gridRow="line3/line4"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        disablePadding
      >
        <TypingBox
          userId={user.userId}
          friendId={friendId}
        />
      </Box>
    </Box>
  );
};

export default ChatBox;
