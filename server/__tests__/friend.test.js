/* eslint-disable testing-library/await-async-query */
 const request = require('supertest');
 const express = require('express');
 const friendRouter = require('../routes/friend');
 const mongoose = require('mongoose');
 const { User, Friend, Message } = require('../models');

 let server = null;
 let app = null;
 let user = null;
 let friend = null;

 beforeAll(async () => {
   await mongoose.connect('mongodb://127.0.0.1:27017/chat_app');
   app = express();
   app.use(express.json());
   app.use(friendRouter);
   server = app.listen(5000);

   user = new User({
     username: 'Max',
     passwordHash: 'kafkj',
   });
   await user.save();

   friend = new Friend({
     friendName: user.username,
     friendId: user._id,
   });
   await friend.save();
 });

 afterAll(async () => {
   await server.close();
   await User.deleteOne({ _id: user._id });
   await Friend.deleteOne({ _id: friend._id });
   await mongoose.connection.db.dropDatabase()
   await mongoose.disconnect();
 });


 describe('testing the friend router', () => {
    let user1 = null;
    let user2 = null;
    let user3 = null;
    let friend1 = null;
    let friend2 = null;
    let friend3 = null;

    beforeAll(async () => {
      user1 = new User({
        username: 'fernando',
        passwordHash: 'aldlfkl',
      });
      user2 = new User({
        username: 'esteban',
        passwordHash: 'sfkfl',
      });
      user3 = new User({
        username: 'nikita',
        passwordHash: 'afkdf',
      });

      await Promise.all([
        user1.save(),
        user2.save(),
        user3.save(),
      ]).catch(err => console.log(err));

      friend1 = new Friend({
        friendName: user1.userName,
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
      ]).catch(err => console.log(err));
    });

    afterAll(async () => {
      await Promise.all([
        User.deleteOne({ _id: user1._id }),
        User.deleteOne({ _id: user2._id }),
        User.deleteOne({ _id: user3._id }),
        Friend.deleteOne({ _id: friend1._id }),
        Friend.deleteOne({ _id: friend2._id }),
        Friend.deleteOne({ _id: friend3._id }),
      ]).catch(err => console.log(err));
    });

    test('GET "/:userId/friends"', async () => {
      await Promise.all([
        User.addFriend(user._id, friend1.friendId),
        User.addFriend(user._id, friend2.friendId),
        User.addFriend(user._id, friend3.friendId),
      ]).catch(err => console.log(err));

      const response = await request(app)
        .get(`/${user._id}/friends`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .catch(err => console.log(err));

      expect(response.header['content-type']).toMatch(/json/);
      expect(response.status).toEqual(200);
      expect(response.body.friends.length).toEqual(3);
    });

    test('DELETE "/:userId/friends/:friendId/remove"', async () => {
      const response = await request(app)
        .delete(`/${user._id}/friends/${friend2.friendId}/remove`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .catch(err => console.log(err));

      expect(response.status).toEqual(200);

      const friends = await User.getFriends(user2._id)
        .catch(err => console.log(err));

      expect(friends.length).toEqual(0);
    });

    test('GET "/:userId/friends/:friendId/messages"', async () => {
      const message = new Message({
        authorId: user2._id,
        text: "hello from user2",
      });
      await message.save().catch(err => console.log(err));
      await User.addFriendMessage(user._id, user2._id, message._id)
        .catch(err => console.log(err));

      const response = await request(app)
        .get(`/${user._id}/friends/${user2._id}/messages`)
        .set('Accept', 'application/json')
        .catch(err => console.log(err));

      // console.log(response.body.messages)
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toEqual(200);
      expect(response.body.messages.length).toEqual(1);
    });

    test('POST "/:userId/friends/addFriend"', async () => {
      const response = await request(app)
        .post(`/${user._id}/friends/addFriend`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send(JSON.stringify({ friendId: user1._id }))
        .catch(err => console.log(err));

      expect(response.status).toEqual(200);
    });
 });