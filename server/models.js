const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');


function stringToObjectId (id) {
  try {
    const newId = mongoose.Types.ObjectId(id);
    return newId;
  } catch(error) { throw new Error('id is invalid'); }
}

const FRIEND = new Schema({
  friendId: {
    type: String,
    default: '',
  },
  friendName: {
    type: String,
    default: '',
  },
  profilePicture: {
    type: String,
    default: '',
  },
});

const MESSAGE = new Schema({
  authorId: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  time: {
    type: String,
    default: new Date().toLocaleTimeString(),
  },
});

const MESSAGEGROUP = new Schema({
  messages: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    default: [],
  },
});

const GROUP = new Schema({
  groupName: {
    type: String,
    required: true,
  },
  members: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Friend' }],
    default: [],
  },
  creator: {
    type: String,
    required: true,
  },
  groupPicture: {
    type: String,
    default: '',
  },
  messages: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    default: [],
  },
});

const CONTAINER = new Schema({
  friendId: {
    type: String,
    required: true,
  },
  messageGroupId: {
    type: String,
    require: true,
  },
});

const USER = new Schema({
  username: {
    type: String,
    default: '',
    required: true,
  },
  passwordHash: {
    type: String,
    default: '',
    required: true,
  },
  createdAt: {
    type: String,
    default: new Date().toLocaleString(),
  },
  profilePicture: {
    type: String,
    default: '',
  },
  friends: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Friend' }],
    default: [],
  },
  groups: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    default: [],
  },
  messages: {
    type: [CONTAINER],
    default: [],
  },
  lastOnline: {
    type: String,
    default: new Date().toLocaleTimeString(),
  },
});


MESSAGE.statics.createMessage = async function (authorId, text = '', images = []) {
  if (text === '' && images.length === 0) throw new Error('text and images are empty!');
  const message = this.create({
    authorId: authorId.toString(),
    text: text,
    images: images,
    time: `${new Date().toLocaleTimeString()}`
  });

  return message;
};

const Message = model('Message', MESSAGE);
const MessageGroup = model('MessageGroup', MESSAGEGROUP);
const Container = model('Container', CONTAINER);
const Friend = model('Friend', FRIEND);

GROUP.methods.addMember = function (friendId) {
  return new Promise(async (resolve, reject) => {
    try {
      friendId = mongoose.Types.ObjectId(friendId);
      if (friendId === undefined && !await Friend.exists({ friendId: friendId.toString() })) throw new Error("friend document doesnt exists!");
      const doc = await Friend.findOne({ friendId: friendId }).lean()
        .catch(err => { throw err; });

      this.members.push(doc._id);
      await this.save().catch(err => { throw err; });
      resolve();
    } catch (error) { reject(error); }
  });
};

GROUP.statics.getMembers = function (groupId) {
  return new Promise(async (resolve, reject) => {
    try {
      groupId = mongoose.Types.ObjectId(groupId);
      if (groupId === undefined && !await this.findById(groupId)) throw new Error('group id is invalid!');
      const doc = await this.findById(groupId).populate('members').lean()
        .catch(err => { throw err; });
      const members = doc.members;
      resolve(members);
    } catch (error) { reject(error); }
  });
};

GROUP.statics.getMessages = async function (groupId) {
  try {
    groupId = stringToObjectId(groupId);
    const group = await this.findById(groupId).populate('messages').lean();
    return group.messages || [];
  } catch(error) { throw error; }
}

GROUP.statics.addMessage = async function (groupId, messageIdArray) {
  try {
    groupId = stringToObjectId(groupId);
    // console.log(groupId);
    const group = await this.findById(groupId);
    // console.log(group);
    for (const item of messageIdArray) {
      group.messages.push(item);
    }
    await group.save();
    return;
  } catch (error) { throw error; }
};

GROUP.statics.removeMember = async function(groupId, friendId) {
  groupId = stringToObjectId(groupId);
  friendId = stringToObjectId(friendId);

  const group = await this.findById(groupId);
  const friend = await Friend.findOne({ friendId: friendId }).lean();
  let index = -1;

  const len = group.members.length;
  for (let i = 0; i < len; i++) {
    if (group.members[i].toString() === friend._id.toString()) {
      index = i;
      break;
    }
  }

  let arr = [ ...group.members.slice(0, index), ...group.members.slice(index + 1, len)]
  group.members = arr;
  await group.save();
};

const Group = model('Group', GROUP);

USER.statics.createNew = function(username, passwordHash) {
  return new Promise(async (resolve, reject) => {
    const user = await this.create({
      username: username,
      passwordHash: passwordHash,
    })
    .catch(err => console.log(err));

    await user.save().catch(err => reject(err));

    const friend = new Friend({
      friendName: user.username,
      friendId: user._id,
    });
    await friend.save().catch(err => reject(err));

    resolve(user);
  });
};

USER.statics.changePicture = async function (userId, image) {
  if (userId === undefined || image === undefined )
    throw new Error("userId or image is not defined");
  
  // check if teh user document exists
  if (!await User.exists({ _id: userId }))
    throw new Error('user document doesnt exists!');

  const user = await this.findById(userId);
  user.profilePicture = image;

  const friend = await Friend.findOne({ friendId: userId });
  friend.profilePicture = image;

  await Promise.all([ user.save(), friend.save() ])
    .catch(err => { throw err; });
};

USER.statics.changeName = async function (userId, username) {
  if (userId === undefined && username === undefined)
    throw new Error('userId or username is undefined!');

  if (!await User.exists({ _id: userId }))
    throw new Error('user document doesnt exists');

  const user = await this.findById(userId);

  user.username = username;

  const friend = await Friend.findOne({ friendId: userId })
  friend.friendName = username;

  await Promise.all([ user.save(), friend.save() ])
    .catch(err => { throw err; });
}

USER.statics.getFriends = function(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await this.findById(userId).populate('friends').lean();
      const friends = doc.friends;
      resolve(friends);
    } catch (error) { reject(error);}
  });
};

USER.statics.getGroups = async function (userId) {
  const doc = await this.findById(userId).populate('groups').lean()
    .catch(err => console.log(err));
  const groups = doc.groups;
  return groups;
};

USER.statics.userExists = async function (userId) {
  const result = await this.exists({ _id: userId });
  return result;
};

USER.statics.getUser = async function (userId) {
  const doc = await this.findById(userId).lean();
  return doc;
};

USER.statics.searchUser = async function (name) {
  const docs = await this.findOne({ username: new RegExp(name, 'i') })
  return docs;
};


USER.statics.addFriend = async function (userId, friendId) {
  return new Promise(async (resolve, reject) => {
      if (userId === undefined && !User.exists({ _id: userId })) reject('User document doesnt exists!');
      if (friendId === undefined && !Friend.exists({ friendId: friendId })) reject('Friend Document doesnt exists');

      const friend = await Friend.findOne({ friendId: friendId }).lean()
        .catch(err => reject(err));
      if (friend === null) reject('friend document is null');

      // creating a new message group
      const msgGroup = new MessageGroup({});
      await msgGroup.save().catch(err => reject(err));

      const container = new Container({
        friendId: friendId,
        messageGroupId: msgGroup._id,
      });

      const secondContainer = new Container({
        friendId: userId,
        messageGroupId: msgGroup._id,
      });

      await Promise.all([ container.save(), secondContainer.save() ])
        .catch(err => reject(err));

      const user = await this.findById(userId).catch(err => reject(err));
      const secondUser = await this.findById(friendId).catch(err => reject(err));

      // adding boths friend document to their list
      user.friends.push(friend._id);

      const friendDoc = await Friend.findOne({ friendId: userId }).lean().catch(err => reject(err));
      secondUser.friends.push(friendDoc._id);

      // adding message group in both the users
      user.messages.push(container);
      secondUser.messages.push(secondContainer);
      await Promise.all([ user.save(), secondUser.save()])
        .catch(err => console.log(err));
      resolve();
  });
};


USER.methods.addGroup = async function (groupId) {
  return new Promise(async (resolve, reject) => {
    try {
      if (groupId === undefined && !Group.exists({ _id: groupId }))
        throw new Error('group document doesnt exists');
    
      this.groups.push(groupId);
      await this.save().catch(err => console.log(err));
      resolve();
    } catch (error) {
      reject(error);
      }
  });
}

USER.statics.getFriendMessages = async function(userId, friendId) {
  if (userId === undefined && friendId === undefined) throw new Error('argument are invalid');
  const user = await User.findById(userId).lean();
  // finding the messageGroupId
  let messageGroupId = null;
  for (const item of user.messages) {
    if (friendId.toString() === item.friendId.toString()) {
      messageGroupId = item.messageGroupId;
      break; 
    }
  }
  if (messageGroupId === null) throw new Error('cannot find the message Group');
  const messageGroup = await MessageGroup.findById(messageGroupId).populate('messages').lean();
  return messageGroup.messages || [];
};


USER.statics.addFriendMessage = async function(userId, friendId, messageId) {
  if (userId === undefined || friendId === undefined || messageId === undefined) throw new Error('arguments are incorrect');

  let messageGroupId = null;
  const user = await this.findById(userId).lean();

  // finding the message group id
  for (const item of user.messages) {

    if (item.friendId === friendId.toString()) {
      messageGroupId = item.messageGroupId;
      break;
    }
  }
  if (messageGroupId === null) throw new Error('cannot find the message group id in the user');
  messageGroupId = stringToObjectId(messageGroupId);
  const messageGroup = await MessageGroup.findById(messageGroupId);
  messageGroup.messages.push(messageId);
  await messageGroup.save();
  return;
};

USER.statics.removeFriend = async function (userId, friendId) {
  if(userId === undefined || friendId === undefined) throw new Error('arguments are invalid');
  friendId = stringToObjectId(friendId);

  const friend = await Friend.findOne({ friendId: friendId }).lean();
  const user = await this.findById(userId);

  let friendsArray = [];
  let index = -1;
  for (let i = 0; i < user.friends.length; i++) {
    if (user.friends[i].toString() === friend._id.toString()) {
      index = i;
      break;
    }
  }
  if (index === -1) throw new Error('cannot find the friends Id in the array!');
  friendsArray = [ ...user.friends.slice(0, index), ...user.friends.slice(index+1, user.friends.length) ];

  user.friends = friendsArray;
  await user.save();
};

USER.statics.removeGroup = async function(userId, groupId) {
  if (userId === undefined || groupId === undefined) throw new Error('arguments are invalid');

  const group = await Group.findById(groupId).populate('members').lean();
  if (group === null) throw new Error('null received instead of group document');

  const members = group.members;
  const len = members.length;
  for (let i = 0; i < len; i++) {
    try {
      console.log('called1');
      const memberId = members[i].friendId;
      const doc = await this.findById(memberId).populate('groups');
      const groups = doc.groups;

      console.log('called2', groups);

      let index = -1;
      for (let item = 0; item < groups.length; item++) {
        if (groups[item]._id.toString() === groupId.toString()) {
          index = item;
          break;
        }
      }

      console.log('called3');

      if (index === -1 ) continue;
      const newGroups = [ ...groups.slice(0, index), ...groups.slice(index + 1, groups.length)];
      doc.groups = newGroups;
      await doc.save();
    } catch (err) {
      console.log(err);
    }
  }

  // deleting the group document 
  await Group.deleteOne({ _id: groupId});
  return;
};


const User = model('User', USER);

module.exports = { User, Friend, Group, Message, MessageGroup, Container };

