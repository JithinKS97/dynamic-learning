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
    
    return Meteor.users
      .find({}).fetch()
      .filter(user=>_idArray.includes(user._id))
      .map(user=>{
        return {
          username: user.username,
          userId: user._id
        }
      })
    }
})

if(Meteor.isServer) {
  Accounts.validateNewUser(validateNewUser)

  Meteor.publish('getAccounts', function () {
    return Meteor.users.find(); 
  })
}
