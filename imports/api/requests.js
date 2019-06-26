/* eslint-disable no-case-declarations */
/* eslint-disable object-shorthand, meteor/audit-argument-checks, import/prefer-default-export */
import { Mongo } from 'meteor/mongo';
import moment from 'moment';

export const Requests = new Mongo.Collection('requests');

if (Meteor.isServer) {
  // eslint-disable-next-line func-names, prefer-arrow-callback
  Meteor.publish('requests', function () {
    return Requests.find();
  });
}

Meteor.methods({
  'requests.update'(_id, slides, operation, args) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let requests;
    switch (operation) {
      case 'modifySlidesList':
        Requests.update(
          // Only owner of the forum is allowed this update
          // (So request.userId === this.userId is true)
          { _id, userId: this.userId },
          { $set: { slides, updatedAt: moment().valueOf() } },
        );
        break;
      // memberOp is member operations, Request.update is done only
      // if current user is present in request.members array
      case 'memberOp':
        Requests.update(
          // Only members of the forum are allowed to perform this operation,
          // So request.members (array) should include this.userId
          { _id, members: { $in: [this.userId] } },
          { $set: { slides, updatedAt: moment().valueOf() } },
        );
        break;
      case 'editComment':
        requests = Requests.findOne({ _id });
        // Only owner of the comment allowed to perform this
        // args._id is the ID of the comment to be edited
        // comment.userId === this.userId
        if (
          requests
            .slides[args.curSlide]
            .comments
            // The comment is found out by matching ids
            .filter(comment => comment._id === args._id)[0]
            // ownership of comment is checked
            .userId === this.userId
        ) {
          Requests.update(
            { _id, members: { $in: [this.userId] } },
            { $set: { slides, updatedAt: moment().valueOf() } },
          );
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      case 'editReply':
        // same as editComment function
        requests = Requests.findOne({ _id });
        if (
          requests
            .slides[args.curSlide]
            .comments
            .filter(comment => comment._id === args.commentId)[0]
            .replies
            .filter(reply => reply._id === args.replyId)[0]
            .userId === this.userId
        ) {
          Requests.update(
            { _id, members: { $in: [this.userId] } },
            { $set: { slides, updatedAt: moment().valueOf() } },
          );
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      case 'editSim':
        // Only owner of the sim allowed to perform this
        // sim.userId === this.userId
        requests = Requests.findOne({ _id });
        if (
          requests
            .slides[args.curSlide]
            .iframes[args.index]
            .userId === this.userId
        ) {
          Requests.update(
            { _id, members: { $in: [this.userId] } },
            { $set: { slides, updatedAt: moment().valueOf() } },
          );
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      default:
    }
  },

  'requests.addPendingRequest'(_id) {
    // Only authenticated users are allowed to perform this
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update(
      // When a userId is added to pendingRequests list
      // Its checked already if the userId is present to avoid duplication
      { _id, pendingRequests: { $nin: [this.userId] }, members: { $nin: [this.userId] } },
      { $push: { pendingRequests: this.userId } },
    );
  },

  'requests.changeOpenedTime'(_id) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update({ _id, userId: this.userId }, { $set: { createdAt: Date.now() } });
  },

  'requests.addMember'(_id, memberId) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // userId: this.userId ensures that only owner of the forum can accept members

    // members: { $nin: [memberId] } ensures that userId of a
    // user is added only once into the members list.
    Requests.update(
      { _id, userId: this.userId, members: { $nin: [memberId] } },
      { $push: { members: memberId } },
    );
    // Removes the userId from the pendingRequests list when they are added to the members list.
    Requests.update(
      { _id, userId: this.userId, members: { $in: [memberId] } },
      { $pull: { pendingRequests: memberId } },
    );
    // allMembers contain userIds of all the members,
    // even those that have been left.
    Requests.update(
      { _id, userId: this.userId, allMembers: { $nin: [memberId] } },
      { $push: { allMembers: memberId } },
    );
  },

  'requests.removeMember'(_id) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // When a user leaves frome a request forum
    // Checked if request.members.includes(currentUserId)
    // When a member leaves a forum,
    // they are removed from members list, not from allMembers list.
    Requests.update(
      { _id, members: { $in: [this.userId] } },
      { $pull: { members: this.userId } },
    );
  },


  'requests.reset'(_id) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // Only owner can reset the forum
    Requests.update({
      _id,
      userId: this.userId,
    },
    {
      $set: {
        requestTitle: '',
        slides: [],
        updatedAt: moment().valueOf(),
        description: '',
        members: [this.userId],
        pendingRequests: [],
        createdAt: Date.now(),
      },
    });
  },

  'requests.title.update'(_id, requestTitle, description) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // Only owner of the forum can update title
    Requests.update({
      _id,
      userId: this.userId,
    },
    {
      $set: {
        requestTitle,
        description,
        updatedAt: moment().valueOf(),
      },
    });
  },
});
