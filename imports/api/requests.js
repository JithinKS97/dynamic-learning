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

    switch (operation) {
      case 'editingSlidesList':
        Requests.update({ _id, userId: this.userId }, { $set: { slides, updatedAt: moment().valueOf() } });
        break;
      case 'postComment':
        Requests.update({ _id, members: { $in: [this.userId] } }, { $set: { slides, updatedAt: moment().valueOf() } });
        break;
      case 'editComment':
        const requests = Requests.findOne({ _id });
        if (
          requests
            .slides[args.curSlide]
            .comments
            .filter(comment => comment._id === args._id)[0]
            .userId === this.userId
        ) {
          Requests.update({ _id, members: { $in: [this.userId] } }, { $set: { slides, updatedAt: moment().valueOf() } });
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
