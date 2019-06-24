/* eslint-disable no-case-declarations */
/* eslint-disable max-len */
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
      case 'editingSlidesList':
        Requests.update({ _id, userId: this.userId }, { $set: { slides, updatedAt: moment().valueOf() } });
        break;
      case 'memberOp':
        Requests.update({ _id, members: { $in: [this.userId] } }, { $set: { slides, updatedAt: moment().valueOf() } });
        break;
      case 'editComment':
        requests = Requests.findOne({ _id });
        if (
          requests
            .slides[args.curSlide]
            .comments
            .filter(comment => comment._id === args._id)[0]
            .userId === this.userId
        ) {
          Requests.update({ _id, members: { $in: [this.userId] } }, { $set: { slides, updatedAt: moment().valueOf() } });
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      case 'editReply':
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
          Requests.update({ _id, members: { $in: [this.userId] } }, { $set: { slides, updatedAt: moment().valueOf() } });
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      case 'editSim':
        requests = Requests.findOne({ _id });
        if (
          requests
            .slides[args.curSlide]
            .iframes[args.index]
            .userId === this.userId
        ) {
          Requests.update({ _id, members: { $in: [this.userId] } }, { $set: { slides, updatedAt: moment().valueOf() } });
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      default:
    }
  },

  'requests.addPendingRequest'(_id, memberId) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update({ _id, pendingRequests: { $nin: [memberId] }, members: { $nin: [memberId] } }, { $push: { pendingRequests: memberId } });
  },

  'requests.changeOpenedTime'(_id) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update({ _id }, { $set: { createdAt: Date.now() } });
  },

  'requests.addMember'(_id, memberId) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update({ _id, members: { $nin: [memberId] } }, { $push: { members: memberId } });
    Requests.update({ _id, members: { $in: [memberId] } }, { $pull: { pendingRequests: memberId } });
    Requests.update({ _id, allMembers: { $nin: [memberId] } }, { $push: { allMembers: memberId } });
  },

  'requests.removeMember'(_id, memberId) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update({ _id, members: { $in: [memberId] } }, { $pull: { members: memberId } });
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
