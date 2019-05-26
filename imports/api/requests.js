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
  'requests.update'(_id, slides) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Requests.update({ _id }, { $set: { slides, updatedAt: moment().valueOf() } });
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
