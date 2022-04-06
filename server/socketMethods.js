const { User, Friend, Message, Group } = require("./models");

const addMessage = (data) => {
  return new Promise(async (resolve, reject) => {
    let { sender, reciever, text, images } = data;
    text = (text === undefined ? '' : text);
    images = (images === undefined ? [] : images);
    if (sender === undefined || reciever === undefined) reject("sender or receiver id is undefined");
    
    // create a new message document
    const message = await Message.createMessage(sender, text, images)
      .catch(err => reject(err));
    
    if (message === null) reject('message document is null!');
    
    // add the message to the message Group document
    await User.addFriendMessage(sender, reciever, message._id)
      .catch(err => reject(err));

    resolve(reciever);
  });
};


const addGroupMessage = (data) => {
  return new Promise(async (resolve, reject) => {
    let { sender, reciever, text, images } = data;
    text = (text === undefined ? '' : text);
    images = (images === undefined ? [] : images);

    if (sender === undefined || reciever === undefined) reject("sender or receiver id is undefined");

    //create new message document 
    const message = await Message.createMessage(sender, text, images)
      .catch(err => reject(err));

    if (message === null) reject('message document is null');

    // add the message to the group document
    await Group.addMessage(reciever, [message._id])
      .catch(err => reject(err));

    // get the members of the group
    const group = await Group.findById(reciever).populate('members').lean()
      .catch(err => reject(err));

    const members = group.members;

    resolve(members);
  });
};

const checkUsername = ({ username }) => {
  return new Promise(async (resolve, reject) => {
    if (username === undefined || username === '') reject('username is invalid!');

    const result = await User.exists({ username: username })
      .catch(err => reject(err));

    resolve(Boolean(result));
  });
};

const getUsers = ({ username }) => {
  return new Promise(async (resolve, reject) => {
    if (username === undefined || username === '') reject('search text is invalid!');
    const regex = new RegExp(`${username}`, 'i');

    const users = await Friend.find({ friendName: regex }).lean()
      .catch(err => reject(err));

    resolve(users);
  });
};

module.exports = {
  addMessage,
  addGroupMessage,
  checkUsername,
  getUsers,
};