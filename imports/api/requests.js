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
          // Only owner of the forum is allowed this update (So request.userId === this.userId)
          { _id, userId: this.userId },
          { $set: { slides, updatedAt: moment().valueOf() } },
        );
        break;
      // memberOp is member operations, Request.update is done only if
      // current user is a member of the forum
      case 'memberOp':
        Requests.update(
          // Only members of the forum are allowed to perform this operation,
          // So request.members should include this.userId
          { _id, members: { $in: [this.userId] } },
          { $set: { slides, updatedAt: moment().valueOf() } },
        );
        break;
      case 'editComment':
        requests = Requests.findOne({ _id });
        // Only owner of the comment allowed to perform this
        // _id of the comment is present in args._id
        // comment.userId === this.userId
        if (
          requests
            .slides[args.curSlide]
            .comments
            // The comment is found out by matching _id
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
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update(
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
    // user is added only ones into the members list.
    Requests.update(
      { _id, userId: this.userId, members: { $nin: [memberId] } },
      { $push: { members: memberId } },
    );
    // Removes the userId from the pendingRequests list when they are added to the members list.
    Requests.update(
      { _id, userId: this.userId, members: { $in: [memberId] } },
      { $pull: { pendingRequests: memberId } },
    );
    // allMembers contains userIds of all the members,
    // event that has been left. When a member leaves a forum
    // they are removed from members list, not from allMembers list.
    Requests.update(
      { _id, userId: this.userId, allMembers: { $nin: [memberId] } },
      { $push: { allMembers: memberId } },
    );
  },

  'requests.removeMember'(_id) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update(
      { _id, members: { $in: [this.userId] } },
      { $pull: { members: this.userId } },
    );
  },


  'requests.reset'(_id) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

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
