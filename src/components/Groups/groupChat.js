import React, { useState, useEffect, useRef, forwardRef } from 'react';
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
  Popover,
  List,
  ListItemButton,
  ListItem,
  Collapse,
  ListItemAvatar,
  ClickAwayListener,
  Divider,
  CircularProgress,
  ListItemText,
} from '@mui/material';
import {
  Send,
  AddPhotoAlternate,
  Download,
  ArrowBack,
  MoreVert,
  Add,
  PersonRemove,
  Star,
 } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  addGroupMessage,
  changeActiveGroup,
  changeFriendsList,
  addGroupMember,
  removeGroupMember,
  changeGroupProfilePic,
  changeGroupMemberList,
  addGroupMessageList,
} from '../../store/actionMethods';
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



const SubMenu = ({ openAddMember, openRemoveMember, openChangeProfile }) => {
  const [ openSubMenu, toggleSubMenu ] = useState(false);
  const [ anchorEl, changeAnchorEl ] = useState(null);

  const handleSubMenu = (e) => {
    changeAnchorEl(e.currentTarget);
    toggleSubMenu(!openSubMenu);
  };

  const closeSubMenu = (e) => {
    changeAnchorEl(null);
  };

  const toggleAddMember = () => {
    openAddMember();
    changeAnchorEl(null);
  };

  const toggleRemoveMember = () => {
    openRemoveMember();
    changeAnchorEl(null);
  };

  const toggleChangeProfile = () => {
    openChangeProfile();
    changeAnchorEl(null);
  };
  return (
    <>
      <IconButton onClick={handleSubMenu} >
        <MoreVert sx={{ color: 'opposite.main' }} />
      </IconButton>
      <Popover 
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeSubMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <List disablePadding>
          <ListItemButton onClick={toggleChangeProfile}>
            <AddPhotoAlternate/>
            <Typography variant="poster" fontSize="15px">
              Change picture
            </Typography>
          </ListItemButton>
          <ListItemButton onClick={toggleAddMember}>
            <Add/>
            <Typography variant='poster' fontSize="15px">
              Add Member
            </Typography>
          </ListItemButton>
          <ListItemButton onClick={toggleRemoveMember}>
            <PersonRemove/>
            <Typography variant="poster" fontSize="15px">
              Remove Member
            </Typography>
          </ListItemButton>
        </List>
      </Popover>
    </>
  );
};

const ChangeProfile = forwardRef((props, ref) => {
  const { groupId, userId } = props;
  const [ file, changeFile] = useState(null);
  const input = useRef(null);
  const dispatch = useDispatch();

  const handleBrowseClick = (e) => {
    input.current.click();
  };
  const handleChange = (e) => {
    const file = e.target.files[0];
    changeFile(file);
  };

  const setImage = (e) => {
    // convert the file to base64
    getBase64String(file)
      .then(async (image) => {
        return await fetch(`/${userId}/groups/${groupId}/change_picture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image }),
        });
      })
      .then(response => {
        if (!response.ok && response.status !== 200)
          throw new Error('response is not ok');
        
        getBase64String(file)
          .then(image => dispatch(changeGroupProfilePic(groupId, image)));
      })
      .catch(err => console.log(err));
  };
  return(
    <Box
      sx={{
        position: 'relative',
        top: '15px',
        left: '0px',
        zIndex: '10',
        border: '1px solid',
        borderColor: 'primaryColor.main',
        borderRadius: '8px',
        padding: '5px',
        backgroundColor: 'primary.main',
      }}
      ref={ref}
    >
      <Box>
        <img
          alt={''}
          src={file === null ? '' : URL.createObjectURL(file)}
          width="200px"
          height="200px"
        />
        <Box>
          <Button
            onClick={handleBrowseClick}
            variant="text"
            color="primaryColor"
          >
            Browse files...
            <input
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              onChange={handleChange}
              ref={input}
          />
          </Button>
          <Button
            onClick={setImage}
            variant="text"
            color="primaryColor"
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
});

const AddMemberItem = ({ members, friend, userId, groupId, addMember }) => {
  const { friendName, profilePic, friendId } = friend;
  let already_a_member = useRef(false);

  for (const item of members) {
    if (item.friendId === friendId) {
      already_a_member = true;
      break;
    }
  }

  const handleClick = () => {
    fetch(`/${userId}/groups/${groupId}/addMember`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ friendId }),
    })
    .then(response => {
      if (!response.ok && response.status !== 200) {
        throw new Error('response is not ok!');
      }
      // send the selected Friend to the parent component
      addMember(friendId);
    })
    .catch(err => {
      console.log(err);
    });
  };

  return (
    <Grow in={true}>
      <ListItem
        sx={{
          width: "100%",
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <ListItemAvatar>
          <Avatar alt={friendName} src={profilePic}>{profilePic === '' ? friendName.charAt(0) : null}</Avatar>
        </ListItemAvatar>
        <ListItemText>
          {friendName}
        </ListItemText>
        {
          already_a_member ?
          <IconButton
            onClick={handleClick}
          >
            <Add/>
          </IconButton>
        : null
        }
      </ListItem>
    </Grow>
  );
};


const RemoveMemberItem = ({ member, userId, removeMember, groupId }) =>  {
  const { friendName, profilePic, friendId } = member;

  const handleRemove = (e) => {
    fetch(`/${userId}/groups/${groupId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      accept: 'application/json',
      body: JSON.stringify({ friendId }),
    })
    .then(response => {
      if (response.oK && response.status === 200) removeMember(friendId);
    })
    .catch(err => {
      console.log(err);
    });
  }
  return (
      <Grow in={true}>
        <ListItem
          sx={{
            width: "100%",
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <ListItemAvatar>
            <Avatar>{profilePic === '' ? friendName.charAt(0) : null}</Avatar>
          </ListItemAvatar>
          <ListItemText>
            {friendName}
          </ListItemText>
          <IconButton onClick={handleRemove} disabled={friendId === userId}>
            { friendId === userId ? <Star/> : <PersonRemove/> }
          </IconButton>
        </ListItem> 
      </Grow>
  );
};

const RemoveMember = forwardRef((props, ref) => {
  const  { members, userId, groupId } = props;
  const dispatch = useDispatch();

  const removeMember = (memberId) => {
    fetch(`/${userId}/groups/${groupId}/removeMember`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ memberId: memberId }),
    })
    .then(response => {
      if (response.ok && response.status === 200) dispatch(removeGroupMember(memberId, groupId));
    })
    .catch(err => {
      console.log(err);
    });
  }
  return (
    <Collapse in={true} ref={ref}>
      <Box
        sx={{
          position: 'relative',
          top: '15px',
          left: '0px',
          zIndex: '10',
          border: '1px solid',
          borderColor: 'primaryColor.main',
          borderRadius: '8px',
          padding: '5px',
          backgroundColor: 'primary.main',
        }}
      >
        <Box 
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="flex-start"
          mb="5px"
        >
          <Typography variant="poster" component="p" fontSize="0.9rem"> Remove member:</Typography>
        </Box>
        <Divider sx={{ borderColor: 'opposite.main' }} />
        <Box display="flex" flexDirection="column" padding="5px" paddingTop="10px">
            { members !== undefined || members.length !== 0 ?
            (members.map((member, index) => (
              <RemoveMemberItem key={index} member={member} userId={userId} groupId={groupId} removeMember={removeMember} />
            )))
            : (
              <Typography variant="poster" fontSize="12px" justifySelf="center">
                No members in this group!
              </Typography>
            )
          }
        </Box>
      </Box>
    </Collapse>
  );
});


const AddMember = forwardRef((props, ref) => {
  const { groupId, userId, members } = props;
  const dispatch = useDispatch();
  const [ isLoading, changeLoadingStatus ] = useState(false);
  const friends = useSelector(state => state.friends)

  useEffect(() => {

    // if friends is undefined or friends length is zero
    if (friends === undefined || friends.length === 0) {
      changeLoadingStatus(true);
      fetch(`/${userId}/friends`, {
        method: "GET",
        accept: "application/json"
      })
      .then((response) => response.json())
      .then(res => {
        if (res.friends === undefined) throw new Error('friends is undefined');
        dispatch(changeFriendsList(res.friends));
        changeLoadingStatus(false);
      })
      .catch(err => {
        changeLoadingStatus(false);
        console.log(err);
      });
    }
  }, []);

  const addMember = (friendId) => {
    for(const item of friends) {
      if (item.friendId === friendId) {
        const friend = item;
        dispatch(addGroupMember(friend));
      }
    }
  };
  return (
      <Collapse in={true} ref={ref}>
        <Box
          sx={{
            position: 'relative',
            top: '15px',
            right: '0px',
            zIndex: '10',
            border: '1px solid',
            borderColor: 'primaryColor.main',
            borderRadius: '8px',
            padding: '5px',
            backgroundColor: 'primary.main',
            maxWidth:"500px"
          }}
        >
          <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
            <Typography variant="poster" component="p" fontSize="17px">Add Members:</Typography>
          </Box>
          <Divider/>
          {
            isLoading ? 
            <Box>
              <CircularProgress color="primaryColor" fontSize="20px" />
            </Box>
            : 
            <Box display="flex" flexDirection="row" justifyContent="center">
            {
              friends !== undefined && friends.length !== 0 ?
              <List disablePadding sx={{ width: '100%' }}>
                {friends.map((friend, index) => (
                  <AddMemberItem members={members} friend={friend} groupId={groupId} userId={userId} key={index} addMember={addMember}/>
                ))}
              </List>
              :
              <Typography variant="poster" fontSize="13px"> No friends in your friends list!</Typography>
            }
            </Box>
          }
        </Box>
      </Collapse>
  );
});





const ImageList = ({ images }) => {
  return (
    <Box minWidth="200px" m="0" disablePadding>
      { images !== undefined ? images.map((image, index) => (
        <Box key={index} minWidth="200px" maxWidth="250px" disablePadding position="relative">
          <img alt="" src={image} width="100%" height="100%" style={{ objectFit: "contain" }} />
          <a
            style={{
              position: 'absolute',
              bottom: "10px",
              right: "10px",
              zIndex: "10"
            }}
            download="image.jpeg" href={image}>
            <Download sx={{
              backgroundColor: "#fff",
              border: '1px solid',
              borderColor: 'primaryColor.main',
              borderRadius: '50%',
              padding: '3px',
            }} />
          </a>
        </Box> 
      )) : null }
    </Box>
  );
}; 


const Message = ({ message, members }) => {
  const { authorId, text, images, time } = message;
  const member = members.find((member) => member.friendId === authorId);
  const { name, profilePic } = { name: member.friendName, profilePic: member.profilePicture };
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
          alt={name}
          src={profilePic}
          sx={(theme) => ({
            width: "40px",
            height: "40px",
          })}
        />
        <MessageBox>
          <Typography sx={(theme) => ({ color: 'primaryColor.main' })}>{name}</Typography>
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

// const getBase64String = (file) => new Promise((resolve, reject) => {
//   const fileReader = new FileReader()
//   fileReader.onload = (e) => {
//     resolve(e.target.result);
//   };
//   fileReader.readAsDataURL(file);

//   fileReader.onerror = (error) => reject(error);
// });

const getBase64String = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.style.objectFit = "contain"; 
  img.onload = () => {
    canvas.width = 200;
    canvas.height = 200;

    ctx.drawImage(img, 0, 0, 200, 200);
    const image = canvas.toDataURL('jpeg', 0.1);
    resolve(image);
  };

  img.onerror = (err) => {
    reject(err);
  };

  img.src = url;
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



const TypingBox = ({ userId, groupId }) => {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const [ value, changeValue ] = useState('');
  const [ files, changeFile ] =useState([]);

  const handleInputChange = (e) => {
    changeValue(e.target.value);
  };

  const handleSendButton = async () => {
    if (value !== "" || files.length > 0) {
      // console.log(inputRef.current.files);
      const imageFiles = await convertImageToBase64(inputRef.current.files);
      // console.log(imageFiles);
      dispatch(addGroupMessage(groupId, {
        authorId: userId,
        text: value || '',
        images: imageFiles || [],
        time: `${new Date().toLocaleTimeString()}`,
      }));

      // sending the message on the socket
      StartWorker.handleAddGroupMessage(groupId, value, imageFiles);
      
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


const MessageList = ({ messages, groupId, userId }) => {
  const members = useSelector((state) => {
    for (const item of state.groups) {
      if (item._id === groupId) {
        return item.members;
      }
    }
    return [];
  }, shallowEqual);

  return (
    <>
    {
      messages.map((message, index) => (
        <Message
          key={index}
          message={message}
          members={members}
        />
    ))}
    { messages.length === 0 ? 
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography variant="poster"> No conversation yet! </Typography>
      </Box>
    : null }
    </>
  );
};



const GroupMessageBox = ({ groupId, userId }) => {
  const messageContainerRef = useRef(null);
  const messageBoxRef = useRef(null);

  const messages = useSelector((state) => {
    for (const item of state.groupMessages) {
      if (item === undefined) return [];
      if (item.groupId === groupId) {
        return item.messages;
      }
    } 
    return [];
  }, shallowEqual);

  const messagesLength = messages.length;

  useEffect(() => {
    const container = messageContainerRef.current.getBoundingClientRect();
    messageBoxRef.current.scroll({
      top: container.height,
      left: 0,
      behavior: "smooth",
    });
  }, [messagesLength]);
  return (
    <Box
        gridRow="line2/line3"
        ref={messageBoxRef}

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
          <MessageList messages={messages} groupId={groupId} userId={userId} />
        </Box>
    </Box>
    
  );
};


// function to fetch the members of this group
const fetchMembers = async (userId, groupId) => {
  const response = await fetch(`/${userId}/groups/${groupId}/members`, {
    method: 'GET',
    accept: 'application/json',
  });

  if (!response.ok && response.status !== 200)
    throw new Error('response is not ok');

  const res = await response.json();

  if (res.members === undefined)
    throw new Error('members is undefined');

  return res.members;
};


const fetchMessages = async (userId, groupId) => {
  const response = await fetch(`/${userId}/groups/${groupId}/messages`, {
    method: 'GET',
    accept: 'application/json',
  });

  if (!response.ok && response.status !== 200)
    throw new Error('response is not ok');

  const res = await response.json();

  if (res.messages === undefined)
    throw new Error('messages is undefined');

  
  return res.messages;
};


const GroupChatBox = ({ toggleChatBox }) => {
  const dispatch = useDispatch();
  const [isAddMemberOpen, toggleAddMember]  = useState(false);
  const [isRemoveMemberOpen, toggleRemoveMember] = useState(false);
  const [isChangeProfile, toggleChangeProfile] = useState(false);
  const groupId = useSelector(state => state.activeGroupId);
  const group = useSelector((state) => {
    for (const item of state.groups) {
        if (item._id === groupId) {
          return item;
        }
    }
    return [];
  });

  const { name , profilePic, members } = { name: group.groupName, profilePic: group.groupPicture, members: group.members };

  // storing the user info in an object
  const user = useSelector((state) => (
    { name: state.name, profilePic: state.profilePicture, userId: state.userId }
  ));
  
  // if the user is the creator of the group
  const isCreator = ( group.creator === user.userId);

  useEffect(() => {

    // fetching the members of this groups and dispatching them to the store
    fetchMembers(user.userId, group._id)
    .then(members => {
      dispatch(changeGroupMemberList(group._id, members));
    })
    .catch(err => console.log(err));

    // fetch the messages of this group and dispatching to the store
    fetchMessages(user.userId, group._id)
    .then(messages => {
      dispatch(addGroupMessageList(group._id, messages));
    })
    .catch(err => console.log(err));

    return () => {
      dispatch(changeActiveGroup(''));
    };
  }, [dispatch]);

  const handleAddMember = (e) => {
    toggleAddMember(!isAddMemberOpen);
  };

  const handleRemoveMember = (e) => {
    toggleRemoveMember(!isRemoveMemberOpen);
  };

  const handleChangeProfile = (e) => {
    toggleChangeProfile(!isChangeProfile);
  };

  const closeSubMenu = (e) => {
    toggleAddMember(false);
    toggleRemoveMember(false);
  };

  const handleAddMemberClickAway = () => {
    toggleAddMember(false);
  };

  const handleRemoveMemberClickAway = () => {
    toggleRemoveMember(false);
  };

  const handleChangeProfileClickAway = () => {
    toggleChangeProfile(false);
  };


  return (
    <Box
      display="grid"
      gridTemplateRows="[line1] 50px [line2] calc(100vh - 220px) [line3] 60px [line4]"
      gridTemplateColumns="1fr"
      width={{ xs: "100%" }}
      sx={{ gridGap: "10px" }}
      height="100%"
      disablePadding
    >
      <Box
        gridRow="line1/line2"
        display="flex"
        flexDirection="column"
        borderBottom="1px solid" 
        borderColor="opposite.main"
        pb="5px"
        pt="2px"
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" flexDirection="row" alignItems="center">
            <IconButton onClick={toggleChatBox}>
              <ArrowBack color="primaryColor" />
            </IconButton>
            <Avatar src={profilePic} sx={{ width: "30px", height: "30px" }}>{profilePic === '' ? name.charAt(0) : null}</Avatar>
            <Typography sx={{ color: "opposite.main", fontSize: "1.3rem", marginLeft: "20px" }} component="span">{name}</Typography>
          </Box>
          <Box justifySelf="flex-end">
            { isCreator ? 
            <SubMenu 
              openAddMember={handleAddMember}
              openRemoveMember={handleRemoveMember}
              openChangeProfile={handleChangeProfile}
            /> : null }
          </Box>
        </Box>
        <Box sx={{ height: '0px' }}>
          { isAddMemberOpen ?
            <ClickAwayListener onClickAway={handleAddMemberClickAway}>
              <AddMember groupId={groupId} userId={user.userId}  members={members} />
            </ClickAwayListener>
            : null }
          { isRemoveMemberOpen ? 
            <ClickAwayListener onClickAway={handleRemoveMemberClickAway}>
              <RemoveMember members={members} groupId={groupId}  userId={user.userId} />
            </ClickAwayListener>
          : null }
          { isChangeProfile ?
            <ClickAwayListener onClickAway={handleChangeProfileClickAway}>
              <ChangeProfile groupId={groupId} userId={user.userId} />
            </ClickAwayListener>
            : null
          }
        </Box>
      </Box>
        <GroupMessageBox groupId={group._id} userId={user.userId} />
      <Box
        gridRow="line3/line4"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        disablePadding
      >
        <TypingBox
          userId={user.userId}
          groupId={groupId}
        />
      </Box>
    </Box>
  );
};

export default GroupChatBox;
