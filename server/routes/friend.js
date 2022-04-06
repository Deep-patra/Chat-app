const { Router } = require('express');
const { User } = require('../models');

const friendRouter = Router();


friendRouter.route('/:userId/friends')
  .get(async (req, res) => {
    try {
      const { userId } = req.params;
      const friends = await User.getFriends(userId);
      res.status(200).json({ friends }).end();
    } catch (error) {
      res.status(400).send(error).end();
    }
});

friendRouter.route('/:userId/friends/:friendId/messages')
  .get(async (req, res) => {
    try {
      const { userId, friendId } = req.params;
      if (userId === undefined && friendId === undefined) throw new Error('req params is undefined');

      const messages = await User.getFriendMessages(userId, friendId);
      res.status(200).json({ messages }).end();
    } catch (error) {
      console.log(error);
      res.status(400).send(error).end();
    }
});

friendRouter.route('/:userId/friends/:friendId/remove')
  .delete(async (req, res) => {
    try {
      const { userId, friendId } = req.params;
      
      if (userId === undefined || friendId === undefined) throw new Error('req params are invalid!');
      await User.removeFriend(userId, friendId);

      // removing the user from friend's document
      await User.removeFriend(friendId, userId);

      res.status(200).json({ message: 'done' }).end();
    } catch (error) {
      // console.log(error);
      res.status(400).send(error).end();
    }
});

friendRouter.route('/:userId/friends/addFriend')
  .post(async (req, res) => {
    try {
      const { userId } = req.params;
      const { friendId } = req.body;

      if (userId === undefined && friendId === undefined) throw new Error('userId or friendId is undefined');

      await User.addFriend(userId, friendId);

      res.status(200).end();
     } catch (error) {
      console.log(error);
      res.status(400).end();
    }
  });


module.exports = friendRouter;