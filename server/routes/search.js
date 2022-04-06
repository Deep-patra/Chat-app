const { Friend } = require('../models');
const { Router } = require('express');

const searchRouter = Router();

searchRouter.route('/search')
  .post(async (req, res) => {
    try {
      const { username } = req.body;
      const regex = new RegExp(username, "g");
      // find the friend document of the given username
      const usersList = await Friend.find({ friendName: regex }).lean();
      if (usersList === null) throw new Error('username is not found');

      res.status(200).json({ results: usersList || [] }).end();
    } catch (error) {
      console.log(error);
      res.status(400).send('username is not found').end();
    }
  });


  module.exports = searchRouter;
