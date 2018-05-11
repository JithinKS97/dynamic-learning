import SimpleSchema from 'simpl-schema'
import { Accounts } from 'meteor/accounts-base'

Accounts.validateNewUser((user,password)=>{

    const email = user.emails[0].address

    try {
      new SimpleSchema({
        email: {
          type: String,
          regEx: SimpleSchema.RegEx.Email
        }
      }).validate({email})
    } catch(e) {
      console.log(e)
      throw new Meteor.Error(400, e.message)
    }
    
    return true
  })
 
