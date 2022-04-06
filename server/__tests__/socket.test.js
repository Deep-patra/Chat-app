/* eslint-disable jest/no-conditional-expect */
const WebSocket = require('ws');
const { WebSocketServer } = require('ws');
const http = require('http');
const mongoose = require('mongoose');
const { User, Friend, Message, Group } = require('../models');
const InitializeServer = require('../socket');

const types = {
  ADD_MESSAGE: "ADD_MESSAGE",
  SEARCH_ITEM: "SEARCH_ITEM",
  CHECK_USERNAME: "CHECK_USERNAME",
  ADD_GROUP_MESSAGE: "ADD_GROUP_MESSAGE",
  ERROR: "ERROR",
  REGISTER: "REGISTER",
};

let client1 = null;
let client2 = null;
let client3 = null;
let wss = null;
let server = null;

beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/chat_app')
    .catch(err => console.log(err));
  server = http.createServer();
  //wss = new WebSocketServer({ server });
  InitializeServer(server);
  server.listen(5000);
});

afterEach(async () => {
    // await wss.close();
    await client1.close();
    await client2.close();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  await server.close();
});


test.skip("testing the WebSocket", (done) => {
  wss.on('connection', (ws) => {
    // setTimeout(() => { done(); }, 4000);
    ws.on('message', (message) => {
      // expect(JSON.parse(message)).toStrictEqual({ message: "hello" });
      ws.send(JSON.stringify({ message: "hello everyone"}));
    });
    ws.on('close', () => {
      // done();
    });
  });
  client1.on('open', () => {
    client1.send(JSON.stringify({message: 'hello'}));
  });
  client1.on('message', (message) => {
    expect(JSON.parse(message)).toStrictEqual({message: 'hello everyone'});
    done();
  });
}, 4000);


test.skip('testing the data transfer on pong', (done) => {
  wss.on('connection', (ws) => {
    ws.on('message', (data) => {})
  });

  client1.on('open', () => {
    client1.ping(JSON.stringify({message: 'hello'}))
  });
});

describe('testing the websockets', () => {
  
  let user1 = null;
  let user2 = null;
  let friend1 = null;
  let friend2 = null;
  let message1 = null;
  beforeAll(async () => {
    user1 = new User({
      username: "deep patra",
      passwordHash: 'ksfks',
    });

    user2 = new User({
      username: 'max',
      passwordHash: 'dkfjskj',
    });

    await Promise.all([
      user1.save(),
      user2.save(),
    ]).catch(err => console.log(err));

    friend1 = new Friend({
      friendName: user1.username,
      friendId: user1._id,
    });

    friend2 = new Friend({
      friendName: user2.username,
      friendId: user2._id,
    });

    message1 = new Message({
      authorId: user1._id,
      text: "hello from deep patra",
      images: [],
    });

    await Promise.all([
      friend1.save(),
      friend2.save(),
      message1.save(),
    ]).catch(err => console.log(err));

    // adding the user2 to the user1 friend list
    await User.addFriend(user1._id, user2._id).catch(err => console.log(err));
  });


  test('testing the add message method in websocket', (done) => {

    client1 = new WebSocket('ws://localhost:5000');
    client2 = new WebSocket('ws://localhost:5000');

    client1.on('open', () => {
      client1.send(JSON.stringify({ type: types.REGISTER, userId: user1._id }));
    });
    client1.on('message', (message) => {
      // console.log(message);
      expect(JSON.parse(message)).toStrictEqual({ type: types.ADD_MESSAGE,sender: user2._id.toString(), reciever: user1._id.toString(), text: "hello from max", images: [] });
      // check if the message is stored or not

      User.getFriendMessages(user1._id, user2._id)
      .then((messages) => {
        // console.log(messages);
        expect(messages.length).toEqual(1);
        done();
      })
      .catch(err => done(err));
    });

    client1.on('error', (error) => {
      console.log(error);
    });

    client2.on('open', () => {
      client2.send(JSON.stringify({ type: types.REGISTER, userId: user2._id }));
      client2.send(JSON.stringify({ type: types.ADD_MESSAGE, sender: user2._id, reciever: user1._id, text: 'hello from max', images: [] }));
    });
    
    client2.on('error', (error) => {
      console.log(error);
    });


  }, 15000);
});

describe('testing the group converstion', () => {
  let user1 = null;
  let user2 = null;
  let user3 = null;
  let friend1 = null;
  let friend2 = null;
  let friend3 = null;
  let group = null;

  beforeAll(async () => {
    user1 = new User({
      username: 'kimi',
      passwordHash: 'skfkj',
    });

    user2 = new User({
      username: 'sebastian',
      passwordHash: 'afkdjk',
    });

    user3 = new User({
      username: 'gasly',
      passwordHash: 'flsdlfj',
    });

    await Promise.all([
      user1.save(),
      user2.save(),
      user3.save(),
    ])
    .catch(err => console.log(err));

    friend1 = new Friend({
      friendName: user1.username,
      friendId: user1._id,
    });

    friend2 = new Friend({
      friendName: user2.username,
      friendId: user2._id,
    });

    friend3 = new Friend({
      friendName: user3.username,
      friendId: user3._id,
    });

    await Promise.all([
      friend1.save(),
      friend2.save(),
      friend3.save(),
    ])
    .catch(err => console.log(err));

    group = new Group({
      groupName: 'pansies',
      creator: user1._id,
    });

    await group.save();

    await user1.addGroup(group._id).catch(err => console.log(err));
    await group.addMember(user2._id).catch(err => console.log(err));
    await group.addMember(user3._id).catch(err => console.log(err));

    await user2.addGroup(group._id).catch(err => console.log(err));
    await user3.addGroup(group._id).catch(err => console.log(err));
  });

  afterAll(async () => {
    await client1.close();
    await client2.close();
    await client3.close();
  });

  test('if all the members recieved message', (done) => {
    client1 = new WebSocket('ws://localhost:5000');
    client2 = new WebSocket('ws://localhost:5000');
    client3 = new WebSocket('ws://localhost:5000');

    client2.on('open', () => {
      client2.send(JSON.stringify({ type: types.REGISTER, userId: user2._id }));
    });

    client2.on('message', (message) => {
      const data = JSON.parse(message);
      expect(data.text).toEqual('hello from user1');
    });

    client3.on('open', () => {
      client3.send(JSON.stringify({ type: types.REGISTER, userId: user3._id }));
    });

    client3.on('message', (message) => {
      const data = JSON.parse(message);
      expect(data.text).toEqual('hello from user1');
      done();
    });

    client1.on('open', () => {
      client1.send(JSON.stringify({ type: types.REGISTER, userId: user1._id }));
      client1.send(JSON.stringify({ type: types.ADD_GROUP_MESSAGE, sender: user1._id, reciever: group._id, text: 'hello from user1', images: [] }));
    });
  }, 5000);

  test('check the message stored in the group', async () => {
    const messages = await Group.getMessages(group._id).catch(err => console.log(err));
    expect(messages.length).toEqual(1);
  });
});

describe('testing the searching function', () => {
 
  beforeAll(async () => {
    await Promise.allSettled([
      User.createNew('max', 'kjfksj'),
      User.createNew('daniel', 'ajkf'),
      User.createNew('maxie', 'fksjkf'),
    ]).catch(err => console.log(err));
  });

  afterEach(async () => {
    await client1.close();
  });

  test('testing the search results', (done) => {
    client1 = new WebSocket('ws://localhost:5000');
    client1.on('open', () => {
      client1.send(JSON.stringify({ type: types.SEARCH_ITEM, username: "ma" }));
    });

    client1.on('message', (message) => {
      const data = JSON.parse(message);
      console.log(data);
      expect(data.results.length).toEqual(3);
      done();
    });
  }, 5000);

  test('testing the search results when the user does,t exists', (done) => {
    client1 = new WebSocket('ws://localhost:5000');
    client1.on('open', () => {
      client1.send(JSON.stringify({ type: types.SEARCH_ITEM, username: "dkflsk" })); // sending the username that doesn't exists
    });

    client1.on('message', (message) => {
      const data = JSON.parse(message);
      console.log(data);
      expect(data.results.length).toEqual(0);
      done();
    });
  }, 5000);

  test('testing checkuser method, returns true if the user exists', (done) => {
    client1 = new WebSocket('ws://localhost:5000');

    client1.on('open', () => {
      client1.send(JSON.stringify({ type: types.CHECK_USERNAME, username: "max" }));
    });
    client1.on('message', (message) => {
      const data = JSON.parse(message);

      expect(data.exists).toBeTruthy();
      done();
    });
  });

});

