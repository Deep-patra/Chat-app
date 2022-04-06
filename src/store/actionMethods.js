import {
  CHANGE_THEME,
  CHANGE_PROFILE_PICTURE,
  CHANGE_FRIENDS_LIST,
  REMOVE_FRIEND,
  CHANGE_ACTIVE_FRIEND,
  CHANGE_ACTIVE_GROUP,
  ADD_MESSAGE,
  CHANGE_SEARCH_RESULT,
  RECIEVED_MESSAGE,
  RECIEVED_GROUP_MESSAGE,
  CHANGE_GROUP_LIST,
  CHANGE_GROUP_PROFILEPIC,
  ADD_GROUP,
  ADD_GROUP_MEMBER,
  ADD_GROUP_MESSAGE,
  REMOVE_GROUP_MEMBER,
  REMOVE_GROUP,
  CHANGE_GROUP_MEMBER_LIST,
  SET_USER,
  ADD_MESSAGE_LIST,
  ADD_GROUP_MESSAGE_LIST,
  } from './action';

export const setUser = (user) => ({ type: SET_USER, user });
export const changeTheme = () => ({ type: CHANGE_THEME });
export const changeProfilePicture = (profilePicture) => ({ type: CHANGE_PROFILE_PICTURE, profilePicture });
export const changeFriendsList = (friends) => ({ type: CHANGE_FRIENDS_LIST, friends });
export const removeFriend = (friend) => ({ type: REMOVE_FRIEND, friend });
export const changeActiveFriend = (friendId) => ({ type: CHANGE_ACTIVE_FRIEND, friendId });
export const changeActiveGroup = (groupId) => ({ type: CHANGE_ACTIVE_GROUP, groupId });
export const addMessage = (message) => ({ type: ADD_MESSAGE, message });
export const changeSearchResult = (searchResults) => ({ type: CHANGE_SEARCH_RESULT, searchResults });
export const recievedMessage = (friendId, message) => ({ type: RECIEVED_MESSAGE, friendId, message });
export const recievedGroupMessage = (groupId, message) => ({ type: RECIEVED_GROUP_MESSAGE, groupId, message });
export const changeGroupList = (groups) => ({ type: CHANGE_GROUP_LIST, groups });
export const changeGroupProfilePic = (groupId, profilePic) => ({ type: CHANGE_GROUP_PROFILEPIC, groupId, profilePic });
export const addGroup = (group) => ({ type: ADD_GROUP, group });
export const addGroupMember = (groupId, member) => ({ type: ADD_GROUP_MEMBER, groupId, member });
export const addGroupMessage = (groupId, message) => ({ type: ADD_GROUP_MESSAGE, groupId, message });
export const removeGroupMember = (memberId, groupId) => ({ type: REMOVE_GROUP_MEMBER, groupId, memberId });
export const removeGroup = (groupId) => ({ type: REMOVE_GROUP, groupId });
export const changeGroupMemberList = (groupId, members) => ({ type: CHANGE_GROUP_MEMBER_LIST, groupId, members });
export const addMessageList = (friendId, messages) => ({ type: ADD_MESSAGE_LIST, friendId, messages });
export const addGroupMessageList = (groupId, messages) => ({ type: ADD_GROUP_MESSAGE_LIST, groupId, messages });
