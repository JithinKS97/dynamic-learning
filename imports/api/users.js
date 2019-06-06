/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable object-shorthand, meteor/audit-argument-checks, import/prefer-default-export */
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

export const validateNewUser = (user) => {
  const email = user.emails[0].address;
  new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
  }).validate({ email });

  return true;
};

Meteor.methods({
  'getUsername'(_id) {
    const user = Meteor.users.findOne({ _id });
    if (user) {
      return user.username;
    }
  },
  'getUsernames'(_idArray) {
    const users = Meteor.users.find({}).fetch();
    const usersMap = {};
    users.map((user) => {
      usersMap[user._id] = { userId: user._id, username: user.username };
    });
    return _idArray.map(_id => usersMap[_id]);
  },
});

if (Meteor.isServer) {
  Accounts.validateNewUser(validateNewUser);

  Meteor.publish('getAccounts', () => Meteor.users.find());
}
