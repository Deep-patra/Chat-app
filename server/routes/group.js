const { Router } = require('express');
const { User, Group, Friend } = require('../models'); 
const mongoose = require('mongoose');

const groupRouter = Router();

groupRouter.route('/:userId/groups')
  .get(async (req, res) => {
    try {
      const { userId } = req.params;
      if (!await User.userExists(userId)) throw new Error('user doesnt exists!');
      const groupsDoc = await User.getGroups(userId)
        .catch(err => { throw err; });

      const groups = [];
      for (let item of groupsDoc) {
        groups.push({
          groupName: item.groupName,
          _id: item._id,
          groupPicture: item.groupPicture,
          creator: item.creator,
          members: item.members,
        });
      }
      res.status(200).json({ groups: groups }).end();
    } catch (err) {
      console.log(err);
      res.status(400).send(err).end();
    }
  });

groupRouter.route('/:userId/groups/:groupId/members')
  .get(async (req, res) => {
    try {
      const { groupId } = req.params;
      const members = await Group.getMembers(groupId);
      
      res.status(200).json({ members }).end();
    } catch (error) {
      console.log(error);
      res.status(400).send(error).end();
    }
  });

groupRouter.route('/:userId/groups/:groupId/messages')
  .get(async (req, res) => {
    try {
      const { groupId } = req.params;
      if (groupId === undefined) throw new Error('group id is undefined');
      const messages = await Group.getMessages(groupId);
      res.status(200).json({ messages }).end();
    } catch (error) {
      res.status(400).send(error).end();
    }
  });

groupRouter.route('/:userId/createGroup')
  .post(async (req, res) => {
    try {
      let { userId } = req.params;
      const { groupName } = req.body;
      if (!await User.userExists(userId)) throw new Error('user id is invalid');
      if (groupName === undefined) throw new Error('groupName is undefined');
      const group = new Group({
        groupName: groupName,
        creator: userId,
      });

      userId = mongoose.Types.ObjectId(userId);
      // getting the friendDoc 
      const friend = await Friend.findOne({ friendId: userId }).lean();

      group.members.push(friend._id);
      await group.save().catch(err => { throw err; });

      const user = await User.findById(userId)
        .catch(err => { throw err; });

      await user.addGroup(group._id)
        .catch(err => { throw err; });

      res.status(200).json({ group }).end()
    
    } catch (error) {
      console.log(error);
      res.status(400).send(error).end();
    }
  });

groupRouter.route('/:userId/groups/:groupId/addMember')
  .post(async (req, res) => {
    try {
      const { friendId } = req.body;
      const { groupId } = req.params;

      if (friendId === undefined || !await Friend.exists({ friendId: friendId })) throw new Error("friend id is invalid");
      const group = await Group.findById(groupId).catch(err => { throw err; });
      await group.addMember(friendId).catch(err => { throw err; });

      // adding Group to the member group list
      const user = await User.findById(friendId);
      await user.addGroup(group._id);

      res.status(200).json({ group }).end();
    } catch (error) {
      console.log(error);
      res.status(400).json({ error }).end();
    }
  });

groupRouter.route('/:userId/groups/:groupId/removeMember')
  .post(async (req, res) => {
    try {
      const { userId, groupId } = req.params;
      const { memberId } = req.body;

      if (memberId === undefined) throw new Error('memberId is invalid');

      const group = await Group.findById(mongoose.Types.ObjectId(groupId)).lean();

      if (group.creator !== userId) throw new Error('user is not the creator of the group');

      // remove the member from the group
      await Group.removeMember(groupId, memberId);

      // remove the group from the user's list
      await User.removeGroup(memberId, groupId);

      res.status(200).json({ message: 'done' }).end();
     } catch (error) {
      console.log(error);
      res.status(400).send(error).end();
    }
  });

groupRouter.route('/:userId/groups/:groupId/remove')
  .delete(async (req, res) => {
    try {
      const { userId, groupId } = req.params;

      if (userId === undefined || groupId === undefined) throw new Error('userid or groupId is invalid');
    
      const group = await Group.findById(mongoose.Types.ObjectId(groupId)).populate('members').lean();

      if (group.creator === userId) {
          await User.removeGroup(userId, groupId);
      } else {
        await Group.removeMember(groupId, userId);
        const user = await User.findById(userId);
        const groups = user.groups || [];

        let itemIndex = -1;
        groups.forEach((id, index) => {
          if (id.toString() === groupId.toString()) {
            itemIndex = index;
            return;
          }
        });

        const newGroups = [ ...groups.slice(0, itemIndex), ...groups.slice(itemIndex + 1, groups.length)];
        user.groups = newGroups;
        await user.save();
      }

      res.status(200).json({ message: 'done' });

    } catch (error) { 
      res.status(400).send(error).end();
    }
  });

groupRouter.route('/:userId/groups/:groupId/change_picture')
  .post(async (req, res) => {
    try {
      const { userId, groupId } = req.params;
      const { image } = req.body;

      if (userId === undefined || groupId === undefined || image === undefined)
        throw new Error('userid or groupId or image is undefined');

      if (!await Group.exists({ _id: groupId })) throw new Error('Group document doesnt exists');
      if (!await User.exists({ _id: userId })) throw new Error('User document doesnt exists');

      const group = await Group.findById(groupId);
      group.groupPicture = image;

      await group.save();

      res.status(200).end();

    } catch(error) {
      console.log(error);
      res.status(400).json({ error }).end();
    } 
  });

module.exports = groupRouter;