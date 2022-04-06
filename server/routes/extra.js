const { Router } = require('express');
const { User } = require('../models');


const newRouter = Router();

newRouter.route('/:userId/change_profile_picture')
  .post(async (req, res) => {
    try {
      const { image } = req.body;
      const { userId } = req.params;
    
      await User.changePicture(userId, image);
      res.status(200).end();
    } catch (error) {
      res.status(400).json({ error });
    }
  });

newRouter.route(':/userId/change_username')
  .post(async (req, res) => {
    try {
      const { userId } = req.params;
      const { username } = req.body;

      await User.changeName(userId, username)
      res.status(200).end();
    } catch (error) {
      res.status(400).json({ error });
    }
  });


module.exports = newRouter;