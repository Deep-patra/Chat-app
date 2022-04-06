const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');


const signupRouter = Router();

signupRouter.route('/signup')
  .post(async (req, res) => {
    try {
      const { username, password } = req.body;

      if (username === undefined || password === undefined) throw new Error('username or password is undefined');
      if (username === '' || password === '') throw new Error('username or password is empty!');

      // check if the username exists or not
      if ( await User.exists({ username: username }) ) {
        res.status(300).json({ error: 'username already exists' }).end();
        return;
      }

      // create a hash with bcrypt
      bcrypt.hash(password, 8, async (err, hash) => {
        if (err) throw new Error('Cannot create a hash of the given password');

        if (hash) {
          const user = await User.createNew(username, hash);
          if (user === null) throw new Error('cannot create a new document!');
          await user.save();

          // set the session 
          req.session.userId = user._id;

          res.status(200).json({ 
            username: user.username,
            userId: user._id,
            friends: [],
            groups: [],
           }).end();
        }
      });
    } catch (error) {
      console.log(error)
      res.status(400).send({ error }).end();
    }
  });

module.exports = signupRouter;