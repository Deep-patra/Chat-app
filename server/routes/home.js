const { Router } = require('express');
const { User } = require('../models');

const homeRouter = Router();

homeRouter.route('/home')
 .get(async (req, res) => {
   try {
     const userId = req.session.userId;
     if (userId === undefined) throw new Error('userId is undefined');
     if (!await User.exists({ _id: userId }) ) throw new Error('user document doesnt exists');

     const user = await User.findById(userId).populate(['friends', 'groups']).lean();

     res.status(200).json({
       username: user.username,
       _id: user._id,
       profilePicture: user.profilePicture,
       friends: user.friends,
       groups: user.groups,
     });

   } catch (error) {
     res.status(400).json({ error });
   }
 });

 module.exports = homeRouter;