import React, { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ButtonGroup,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { changeGroupList } from '../../store/actionMethods';
import CreateGroup from './createGroup';
import GroupItem from './groupItem';
import GroupChat from './groupChat';


const NoGroupInfo = () => (
  <ListItem sx={{ display:"flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }} >
    <Typography variant="poster">No groups yet!</Typography>
  </ListItem>
);


const getGroups = async (userId) => {
  const response = await fetch(`/${userId}/groups`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    accept: "application/json",
    mode: "no-cors",
  })
    .catch(err => console.error(err));

  if (!response.ok) throw new Error("response is not ok!");
  if (response.status !== 200) throw new Error("response status code is not 200");

  const res = await response.json();
  if (res.groups === undefined ) throw new Error('groups is undefined');
  return res.groups;
};

const Groups = () => {
  const { groups, userId } = useSelector((state) => ({ groups: state.groups, userId: state.userId }));
  const [ loading, changeLoadingStatus ] = useState(false);
  const [ openChatBox, toggle ] = useState(false);
  const dispatch = useDispatch();

  const fetchGroups = async (userId) => {
    try {
      // changing the loading Status
      changeLoadingStatus(true);
      
      const groupsList = await getGroups(userId);

      dispatch(changeGroupList(groupsList));
      changeLoadingStatus(false);
    } catch (error) {
      // if an error has Occured, change the loading status 
      changeLoadingStatus(false);
      console.error("error in the fetchGroups in Groups component", error);
    }
  };

  useEffect(() => {
    // dispatching the groups fetched to the redux store
    fetchGroups(userId);
  }, []);


  const toggleChatBox = () => {
    toggle(!openChatBox);
  };

  return (
    <Box
    p='5px'
    gridColumn="2 / span 8"
    paddingLeft={{ sm: "20px" }}
    minWidth={{ sm: "380px" }}
    >
      { !openChatBox ? 
       (
       <>
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            minWidth: { sm: "400px" },
            maxWidth: { sm: "800px" , xs: "500px"},
          }}
        >
          <Typography pl="10px" fontSize="20px" variant="poster">Groups</Typography>
          <Box>
            { loading ?
            <CircularProgress color="primaryColor" size="20px"/> : null
            }
            <ButtonGroup>
              <CreateGroup/>
            </ButtonGroup>
          </Box>
        </Box>
        <Box
          sx={{
            minWidth: { sm: "400px" },
            maxWidth: { sm: "800px" },
          }}
        >
          <List>
            { groups !== undefined && groups.length > 0 ?
              ( groups.map((group, index) => (
                <Fragment key={index}>
                  <GroupItem group={group} toggleChatBox={toggleChatBox} userId={userId}/>
                  <Divider/>
                </Fragment>
              )))
              : <NoGroupInfo/>
            }
          </List>
        </Box>
       </>
       )
     : <GroupChat toggleChatBox={toggleChatBox} />}
    </Box>
  );
};

export default Groups;