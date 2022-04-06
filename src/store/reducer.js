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

const initialState = {
  theme: 'light',
  profilePicture: '',
  name: '',
  userId: '',
  usernameExists: false,
  activeFriendId: '',
  activeGroupId: '',
  friends: [],
  groups: [],
  messages: [],
  groupMessages: [],
  searchResults: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER: {
      const { user } = action;
      return { ...state,
        name: user.username|| '',
        userId: user._id|| user.userId || '',
        profilePicture: user.profilePicture || '',
        friends: user.friends || [],
        groups: user.groups || [],
      };
    }
    case CHANGE_THEME:{
      if (state.theme === 'light') return { ...state, theme: 'dark' };
      else return { ...state, theme: 'light'};
    }
    case CHANGE_PROFILE_PICTURE: {
      if (!action.profilePicture) break;
      return { ...state, profilePicture: action.profilePicture };
    }
    case "CHANGE_USERNAME": {
      const { username } = action;
      return { ...state, name: username };
    }
    case "CHANGE_USERNAME_EXISTS": {
      const { result } = action;
      return { ...state, usernameExists: Boolean(result) };
    }
    default: break;
    case CHANGE_FRIENDS_LIST: {
      let { friends } = action;
      if (friends === undefined) break;

      // if the friends received is a object, convert it into array
      if (!Array.isArray(friends)) friends = state.friends.concat(friends);
      return { ...state, friends };
    }
    case REMOVE_FRIEND: {
      const { friend } = action;
      if (friend === undefined) break;

      let friends = state.friends.filter((value) => value.friendId !== friend.friendId);
      return { ...state, friends };
    }
    case CHANGE_ACTIVE_FRIEND: {
      const { friendId } = action;
      if (friendId === undefined) break;

      const activeFriendId = friendId;
      return { ...state, activeFriendId };
    }
    case CHANGE_ACTIVE_GROUP: {
      const { groupId } = action;
      if (groupId === undefined) break;

      const activeGroupId = groupId;
      return { ...state, activeGroupId };
    }
    case ADD_MESSAGE: {
      const { message } = action;
      if (message === undefined) break;
      const { activeFriendId } = state;
      let messages = state.messages;

      for (const item of messages) {
        if (item.friendId === activeFriendId) {
          item.messages.push(message);
          return { ...state, messages };
        }
      }

      const newMessages = messages.concat({ friendId: activeFriendId, messages: [message] });
      return { ...state, messages: newMessages };

    }
    case CHANGE_SEARCH_RESULT: {
      const { searchResults } = action;
      if (searchResults === undefined || searchResults.length === 0) return { ...state, searchResults: [] };

      return { ...state, searchResults };
    }
    case RECIEVED_MESSAGE: {
      const { friendId, message } = action;
      if (friendId === undefined && message === undefined) break;

      console.log('called');

      let messages = state.messages;
      for (const item of messages) {
        if (item.friendId === friendId) {
          item.messages = item.messages.concat(message);
          return { ...state, messages };
        }
      }

      const newMessages = messages.concat({ friendId, messages: [message] });
      return { ...state, messages: newMessages };
    }
    case RECIEVED_GROUP_MESSAGE: {
      const { groupId, message } = action;
      if (groupId === undefined && message === undefined) break;

      const { groupMessages } = state;
      for (const item of groupMessages) {
        if (item.groupId === groupId) {
          item.messages = item.messages.concat(message);
          return { ...state, groupMessages };
        }
      }
      
      const newMessages = groupMessages.concat({ groupId, messages: [message] });
      return { ...state, groupMessages: newMessages };
    }
    case CHANGE_GROUP_LIST: {
      const { groups } = action;
      const { groupMessages } = state;
      if (groups === undefined) break;

      // create new instances in groupMessages
      let groupMessageArray = [];
      groups.forEach((item, index) => {
        const groupMessage = groupMessages.find((packet) => packet.groupId === item._id);
        if (groupMessage === undefined) groupMessageArray.push({ groupId: item._id, messages: [] });
        else groupMessageArray.push(groupMessage[index]);
      });

      return { ...state, groups, groupMessages: groupMessageArray };
    }

    case CHANGE_GROUP_PROFILEPIC: {
      const { groupId, profilePic } = action;
      if (groupId === undefined && profilePic === undefined) break;
      
      const { groups } = state;
      for (const item of groups) {
        if (item._id === groupId) {
          item.groupPicture = profilePic;
          break;
        }
      }
      return { ...state, groups };
    }

    case ADD_GROUP: {
      const { group } = action;
      if (group === undefined) break;
      const { groups } = state;
      const { groupMessages } = state;
      const newGroups = groups.concat(group);

      const newGroupMessage = groupMessages.concat({ groupId: group._id, messages: [] });

      return { ...state, groups: newGroups, groupMessages: newGroupMessage };
    }
    case ADD_GROUP_MEMBER: {
      const { member, groupId } = action;
      if (member === undefined || groupId === undefined) break;
      const { groups } = state;
      for (const item of groups) {
        if (item._id === groupId) {
          item.members.push(member);
          break;
        }
      }

      return { ...state, groups };
    }

    case ADD_GROUP_MESSAGE: {
      const { groupId, message } = action;
      if (groupId === undefined && message === undefined) break;

      const { groupMessages } = state;
      for (const item of groupMessages) {
        if (item.groupId === groupId) {
          if (Array.isArray(message)) item.messages = item.messages.concat(...message);
          else item.messages = item.messages.concat(message);
          break;
        }
      }
      return { ...state, groupMessages };
    }

    case CHANGE_GROUP_MEMBER_LIST: {
      const { groupId, members } = action;
      const { groups } = state;

      for (const item of groups) {
        if (item._id === groupId) {
          item.members = members;
        }
      }

      return { ...state, groups };
    }

    case REMOVE_GROUP_MEMBER: {
      const { memberId, groupId } = action;
      const { groups } = state;
      
      let newMembers = [];
      for (const item of groups) {
        if (item._id === groupId) {
          item.members.forEach((member, index) => {
            if (member.friendId !== memberId) newMembers.push(member);
          });
          item.members = newMembers;
        }
      }

      return { ...state, groups };
    }

    case REMOVE_GROUP: {
      const { groupId } = action;
      const { groups } = state;

      if (groupId === undefined) break;
      let newGroups = [];
      for (const item of groups) {
        if (item._id.toString() === groupId) {
          continue;
        }
        newGroups = newGroups.concat(item);
      }

      return { ...state, groups: newGroups };
    }


    case ADD_MESSAGE_LIST: {
      const { friendId, messages } = action;
      const messageList = state.messages;

      if (friendId === undefined || messages === undefined) break;

      for (const item of messageList) {
        if (item.friendId === friendId) {
          item.messages = messages;
          return { ...state, messages: messageList };
        }
      }

      // if the friend Id is not found in the messages array
      const newMessageList = messageList.concat({ friendId, messages: messages });
      return { ...state, messages: newMessageList };
    }

    case ADD_GROUP_MESSAGE_LIST: {
      const { groupId, messages } = action;
      const { groupMessages } = state;

      for (const item of groupMessages) {
        if (item.groupId === groupId) {
          item.messages = messages;
          return { ...state, groupMessages };
        }
      }

      const newMessages = groupMessages.concat({ groupId, messages });
      return { ...state, groupMessages: newMessages };
    }
  }
  return state;
};


export default reducer;