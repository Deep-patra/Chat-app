const groupRouter = require('../routes/group');
const { User, Group, Friend, Message } = require('../models');
const mongoose = require('mongoose');
const supertest = require('supertest');
const express = require('express');
const { ConnectingAirportsOutlined, GroupOutlined } = require('@mui/icons-material');


describe('testing the group router', () => {
  const app = express();
  let server = null;
  let user = null;
  let secondUser = null;
  let group = null;
  let friend = null;
  let userFriend = null;
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017')
      .catch(err => console.log(err));
    user = new User({
      username: "Deep patra",
      passwordHash: "sdjkfj",
    });
    await user.save().catch(err => console.log(err));

    userFriend = new Friend({
      friendId: user._id,
      friendName: user.username,
    });

    await userFriend.save();

    group = new Group({
      groupName: "everyOne group",
      creator: user._id,
    });
    await group.save().catch(err => console.log(err));

    secondUser = new User({
      username: "James macoy",
      passwordHash: "adfd",
    });
    await secondUser.save().catch(err => console.log(err));

    friend = new Friend({
      friendId: secondUser._id,
      friendName: secondUser.username,
    });
    await friend.save().catch(err => console.log(err));

    app.use(express.json());
    app.use(groupRouter);
    server = app.listen(5000);
  });

  afterAll(async () => {
    await User.deleteOne({ _id: user._id });
    await Group.deleteOne({ _id: group._id });
    await User.deleteOne({ _id: secondUser._id });
    await Friend.deleteOne({ friendId: friend.friendId });
    await mongoose.connection.db.dropDatabase();
    await server.close();
    await mongoose.disconnect();
  });


  test('GET "/:userId/groups" with empty groups array', (done) => {
    supertest(app)
      .get(`/${user._id}/groups`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ groups: [] })
      .end((err) => {
        if (err) return done(err);
        done();
      });
  });


  test('GET "/:userId/groups" with the group array', async () => {
    await user.addGroup(group._id).catch(err => console.log(err));
    const response = await supertest(app)
      .get(`/${user._id}/groups`)
      .set('Accept', 'application/json')
      .catch(err => console.log(err));
    // console.log(response);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.groups[0].groupName).toEqual('everyOne group');
    expect(response.body.groups[0]._id).toEqual(group._id.toString());
  });


  test('POST "/:userId/createGroup"', async () => {
    const response = await supertest(app)
      .post(`/${user._id}/createGroup`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(JSON.stringify({ groupName : "hello Mfuckers!" }))
      .catch(err => console.log(err));

    expect(response.header['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.group.groupName).toEqual('hello Mfuckers!');
  });


  test('POST "/:userId/groups/:groupId/addMember"', async () => {
    const response = await supertest(app)
      .post(`/${user._id}/groups/${group._id}/addMember`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(JSON.stringify({
        friendId: friend.friendId,
      }))
      .catch(err => console.log(err));

    expect(response.header['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.group.groupName).toEqual("everyOne group");
  });

  test('GET /:userId/groups/:groupId/messages', async () => {
    const message = new Message({
      authorId: user._id,
      text: "hello everyOne"
    });
    const message2 = new Message({
      authorId: user._id,
      text: "hello fucker",
    });

    await Promise.all([message.save(), message2.save()]).catch(err => console.log(err));
    await Group.addMessage(group._id, [message._id, message2._id])
      .catch(err => console.log(err));
    
    const response = await supertest(app)
      .get(`/${user._id}/groups/${group._id}/messages`)
      .set('Content-Type', 'application/json')
      .set("Accept", "application/json")
      .catch(err => console.log(err));
    // console.log(response.body.messages);
    expect(response.status).toEqual(200);
    expect(response.body.messages.length).toEqual(2);
  });



  describe('test for the removemember request' , () => {
    let user1 = null;
    let user2 = null;
    let user3 = null;

    beforeAll(async () => {
      user1 = await User.createNew('A', 'skjf').catch(err => console.log(err));
      user2 = await User.createNew('B', 'skjf').catch(err => console.log(err));
      user3 = await User.createNew('C', 'skjf').catch(err => console.log(err));

      await Promise.all([
        user1.save(),
        user2.save(),
        user3.save(),
      ]).catch(err => console.log(err));

      await group.addMember(user1._id).catch(err => console.log(err));
      await group.addMember(user2._id).catch(err => console.log(err));
      await group.addMember(user3._id).catch(err => console.log(err));
    });

    afterAll(async () => {
      await Promise.all([
        User.findByIdAndDelete(user1._id),
        User.findByIdAndDelete(user2._id),
        User.findByIdAndDelete(user3._id),
      ])
      .catch(err => console.log(err));
    });

    test.skip('POST /:userId/groups/:groupId/removeMember', async () => {

      const members = await Group.getMembers(group._id)
        .catch(err => console.log(err));

       const response = await supertest(app)
        .post( `/${user._id}/groups/${group._id}/removeMember`)
        .send(JSON.stringify({ memberId: user2._id }))
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .catch(err => console.log(err));

        expect(response.status).toEqual(200);
        expect(response.headers['content-type']).toMatch(/json/);

        // check if the user2 has got the group in its group list
        const groups = await User.getGroups(user2._id)
          .catch(err => console.log(err));

        expect(groups.length).toEqual(0);

        const newMembers = await Group.getMembers(group._id)
          .catch(err => console.log(err));

        expect(newMembers.length).toEqual(members.length - 1);
    }, 5000);
  });
});