/* eslint-disable testing-library/await-async-query */
const { User, Friend, Group, Message } = require('../models');
const mongoose = require('mongoose');
const { PanoramaHorizontalSelectSharp } = require('@mui/icons-material');

let user = null;
let userFriendDoc = null;
beforeAll(async () => {
  mongoose.connect('mongodb://127.0.0.1:27017/chat_app', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .catch(error => console.log(error));
  user = new User({
    username: "Deep patra",
    passwordHash: "abcdefgh",
  });
  
  await user.save();
  userFriendDoc = new Friend({
    friendName: user.username,
    friendId: user._id,
  });
  await userFriendDoc.save();
});

afterAll(async () => {
  await User.deleteOne({ _id: user._id }).catch(err => console.log(err));
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("testing the model methods", () => {
  
  test("testing for getFriends method", async () => {
    const doc = new User({
      username: "Deep patra",
      passwordHash: "shfdl",
    });

    await doc.save();
    const userId = doc._id;
    const friends = await User.getFriends(userId);
    await User.deleteOne({ _id: userId });
    expect(friends).toStrictEqual([]);
  });

  test("testing for the getGroups methos", async () => {
    const doc = new User({
      username: "Deep Patra",
      passwordHash: "sdfga",
    });

    await doc.save();
    const userId = doc._id;
    const groups = await User.getGroups(userId);
    await User.deleteOne({ _id: userId });
    expect(groups).toStrictEqual([]);
  });
});


describe("testing the addfriend method", () => {
  let user1 = null;
  let friend = null;
  beforeAll(async () => {
    user1 = new User({
      username: "james",
      passwordHash: "adfdf",
    });
    await user1.save();
    friend = new Friend({
      friendId: user1._id,
      friendName: user1.username,
    });
    await friend.save();
  });

  afterAll(async () => {
    await User.deleteOne({ _id: user1._id });
    await Friend.deleteOne({ _id: friend._id });
  });

  test('testing the method', async () => {
    await User.addFriend(user._id, friend.friendId)
      .catch((error) => console.log(error));
    const arr = await User.getFriends(user._id).catch(err => console.log(err));
    const friendDoc = await Friend.findOne({ friendId: friend.friendId }).lean().catch(err => console.log(err));

    // const userDoc = await User.findById(user._id).lean().catch(err => console.log(err));
    // console.log(userDoc);
    expect(arr).toStrictEqual([friendDoc]);
  });
});

describe("testing the addGroup method", () => {
  let group = null;
  beforeAll(async () => {
    group = new Group({
      creator: user._id,
      groupName: "hello1",
    });
    await group.save().catch(error => console.log(error));
  });

  afterAll(async () => {
    if (Group.exists({ _id: group._id }))
      await Group.deleteOne({ groupName: "hello" }).catch((error => console.log(error)));
    const userDoc = await User.findById(user._id).catch(err => console.log(err));
    userDoc.groups = [];
    await userDoc.save();
  });

  test('testing the method', async () => {
    await user.addGroup(group._id).catch(err => console.log(err));
    const userGroup =await User.getGroups(user._id).catch(err => console.log(err));
    // eslint-disable-next-line testing-library/await-async-query
    const groupDoc = await Group.findById({ _id: group._id }).lean().catch(err => console.log(err));
    expect(userGroup).toStrictEqual([groupDoc]);
  });
});


describe("testing the add memeber method on group", () => {
  let group = null;
  let secondUser = null;
  let friend = null;

  beforeAll(async () => {
    group = new Group({
      groupName: "new group",
      creator: user._id,
    });
    await group.save();
    secondUser = new User({
      username: "jamey",
      passwordHash: "ladfk",
    });
    await secondUser.save();
    friend = new Friend({
      friendName: secondUser.username,
      friendId: secondUser._id,
    });
    await friend.save();
  });

  afterAll(async () => {
    await Group.deleteOne({ _id: group._id });
    await User.deleteOne({ _id: secondUser._id });
    await Friend.deleteOne({ _id: friend._id });
  });

  test('adding member to the model', async () => {
    await group.addMember(friend.friendId).catch(err => console.log(err));
    const member = await Group.getMember(group._id).catch(err => console.log(err));
    // console.log(member);
    expect(member.length).toEqual(1);

    // error test
    await group.addMember("kajdfkjd").catch(err => console.log(err));
    const member1 = await Group.getMember(group._id).catch(err => console.log(err));
    expect(member1.length).toEqual(1);
  });
});

describe("testing the remove member method in the Group model", () => {
  let group1 = null;
  let group2 = null;
  let group3 = null;

  beforeAll(async ()  => {
    group1 = new Group({
      groupName: 'F1',
      creator: user._id,
    });
    group2 = new Group({
      groupName: "F2",
      creator: user._id,
    });
    group3 = new Group({
      groupName: 'F3',
      creator: user._id,
    });

    await Promise.all([
      group1.save(),
      group2.save(),
      group3.save(),
    ]).catch(err => console.log(err));
  });

  afterAll(async () => {
    await Promise.all([
      Group.deleteOne({ _id: group1._id }),
      Group.deleteOne({ _id: group2._id }),
      Group.deleteOne({ _id: group3._id }),
    ]).catch(err => console.log(err));
  });

  test('testing the remove group method', async () => {
    await user.addGroup(group1._id);
    await user.addGroup(group2._id);
    await user.addGroup(group3._id);

    const groups = await User.getGroups(user._id).catch(err => console.log(err));

    expect(groups.length).toEqual(3);

    await User.removeGroup(user._id, group2._id);
    const newGroups = await User.getGroups(user._id);

    expect(newGroups.length).toEqual(2);
  });

});

describe('testing the add messages method', () => {
  let message1 = null;
  let message2 = null;
  let group = null;

  beforeAll(async () => {
    message1 = new Message({
      authorId: user._id,
      text: "hello for everyone"
    });
    message2 = new Message({
      authorId: user._id,
      text: "hello ",
    });
    
    group = new Group({
      groupName: "demo",
      creator: user._id,
    });
    await Promise.all([ message1.save(), message2.save(), group.save()])
      .catch(err => console.log(err));
  });

  afterAll(async () => {
    Promise.all([
      Message.deleteOne({ _id: message1._id }),
      Message.deleteOne({ _id: message2._id }),
      Group.deleteOne({ _id: group._id })
    ]).catch(err => console.log(err));
  });

  test('checking the addMessage', async () => {
    await Group.addMessage(group._id, [message1._id, message2._id])
      .catch(err => console.log(err));

    const messages = await Group.getMessages(group._id)
      .catch(err => console.log(err));

    expect(messages.length).toEqual(2);
  });
});

describe('testing friend related methods', () => {
  let friend = null;
  let secondUser = null;
  let message1 = null;
  let message2 = null;
  beforeAll(async () => {
    secondUser = new User({
      username: "sebastian",
      passwordHash: "sfkjd",
    });
    await secondUser.save();
    friend = new Friend({
      friendName: secondUser.username,
      friendId: secondUser._id,
    });
    
    message1 = new Message({
      authorId: secondUser._id,
      text: "hello from sebastian"
    });

    message2 = new Message({
      authorId: user._id,
      text: "hello from Deep patra"
    });

    await Promise.all([ friend.save(), message1.save(), message2.save() ])
      .catch(err => console.log(err));
  });

  afterAll(async () => {
    await Promise.all([
      User.deleteOne({ _id: secondUser._id }),
      Friend.deleteOne({ friendId: secondUser._id }),
      Message.deleteOne({ _id: message1._id }),
      Message.deleteOne({ _id: message2._id }),
    ])
      .catch(err => console.log(err));
  });

  test('testing addMessage methods', async () => {
    // adding second user to the friend list of user
    await User.addFriend(user._id, secondUser._id).catch(error => console.log(error));
    user = await User.findById(user._id).catch(err => console.log(err));
    await User.addFriendMessage(user._id, secondUser._id, message1._id).catch(err => console.log(err));

    let messages = await User.getFriendMessages(user._id, friend.friendId).catch(err => console.log(err));
    expect(messages.length).toEqual(1);

    await User.addFriendMessage(secondUser._id, user._id, message2._id).catch(err => console.log(err));

    messages = await User.getFriendMessages(secondUser._id, user._id).catch(err => console.log(err));
    
    expect(messages.length).toEqual(2);
  });

});


describe("Removing a friend from the users list", () => {
  let friend1 = null;
  let friend2 = null;
  let friend3 = null;
  let user1 = null;
  let user2 = null;
  let user3 = null;
  
  beforeAll(async () => {
    user1 = new User({
      username: "max",
      passwordHash: "sfdlkfk",
    });
    user2 = new User({
      username: "lewis",
      passwordHash: "sfdlkfk",
    });
    user3 = new User({
      username: "charles",
      passwordHash: "sfdlkfk",
    });

    await Promise.all([
      user1.save(),
      user2.save(),
      user3.save(),
    ]).catch(err => console.log(err));

    friend1 = new Friend({
      friendId: user1._id,
      friendName: user1.username,
    });
    friend2 = new Friend({
      friendId: user2._id,
      friendName: user2.username,
    });
    friend3 = new Friend({
      friendId: user3._id,
      friendName: user3.username,
    });

    await Promise.all([
      friend1.save(),
      friend2.save(),
      friend3.save(),
    ]).catch(err => console.log(err));
  });


  afterAll(async () => {
    await Promise.all([
      Friend.deleteOne({ _id: friend1._id }),
      Friend.deleteOne({ _id: friend2._id }),
      Friend.deleteOne({ _id: friend3._id }),
      User.deleteOne({ _id: user1._id }),
      User.deleteOne({ _id: user2._id }),
      User.deleteOne({ _id: user3._id }),
    ]).catch(err => console.log(err));
  });


  test('adding the friends to the user list', async () => {
    const userDoc = await User.findById(user._id).catch(err => console.log(err));
    await Promise.all([
      User.addFriend(userDoc._id, friend1.friendId),
      User.addFriend(userDoc._id, friend2.friendId),
      User.addFriend(userDoc._id, friend3.friendId),
    ]).catch(err => console.log(err));

    let friends = await User.getFriends(user._id).catch(err => console.log(err));
    expect(friends.length).toEqual(3);

    await User.removeFriend(user._id, friend2.friendId).catch(err => console.log(err));
    friends = await User.getFriends(user._id).catch(err => console.log(err));

    expect(friends.length).toEqual(2);
  });
});


describe('creating the message' , () => {
  let secondUser = null;
  let secondFriend = null;
  beforeAll(async () => {
    secondUser = new User({
      username: 'jean',
      passwordHash: 'akjdfhkj',
    });

    await secondUser.save();
    secondFriend = new Friend({
      friendName: secondUser.username,
      friendId: secondUser._id,
    });

    await secondUser.save();
  });

  afterAll(async () => {
    await User.deleteOne({_id: secondUser._id});
    await Friend.deleteOne({ _id: secondFriend._id});
  });

  test('creating a new message with message model method', async () => {
    const message = await Message.createMessage(user._id, "hello");

    expect(message instanceof Message).toBeTruthy();
  });
});

describe('testing the user models create new method', () => {
  test('checking if the value returned is User document', async () => {
    const newUser = await User.createNew("deep patra", "kjfkjd")
      .catch(err => console.log(err));

    expect(newUser instanceof User).toBeTruthy();

    const newfriend = await Friend.findOne({ friendId: newUser._id })
      .catch(err => console.log(err));

    expect(newfriend instanceof Friend).toBeTruthy();
  });
});

