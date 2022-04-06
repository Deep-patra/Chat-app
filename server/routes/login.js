const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const loginRouter = Router();

loginRouter.route('/login')
  .post(async (req, res) => {
    try {
      const { username, password } = req.body;
       if (username === undefined || password === undefined) throw new Error('username or password is undefined');

       if (username === '' || password === '')
        throw new Error('username or password is empty');

      if (!User.exists({ username: username }))
        throw new Error('Document with the given username doesnt exists!');

      const user = await User.findOne({ username: username })
        .populate('friends')
        .populate('groups')
        .lean();

      bcrypt.compare(password, user.passwordHash, (err, result) => {
        if (err) throw new Error ('error in the checking the password');

        if (result === false) res.status(300).json({ error: 'password is incorrect' }).end();
        if (result === true) {
          // set the session
          req.session.userId = user._id.toString();
          
          res.status(200).json({ 
            username: user.username,
            userId: user._id,
            friends: user.friends,
            groups: user.groups,
           }).end();
        }
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error }).end();
    }
});

module.exports = loginRouter;