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

    return 'HAL 9000'; // this is a hack
  },
});

if (Meteor.isServer) {
  Accounts.validateNewUser(validateNewUser);
}
