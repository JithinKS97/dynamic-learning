import SimpleSchema from 'simpl-schema'
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'

export const validateNewUser = (user)=>{

  const email = user.emails[0].address
 
  new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validate({email})

  return true
  
}

if(Meteor.isServer) {
  Accounts.validateNewUser(validateNewUser)
}


 
