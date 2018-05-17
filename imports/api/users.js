import SimpleSchema from 'simpl-schema'
import { Accounts } from 'meteor/accounts-base'

Accounts.validateNewUser((user,password)=>{

    const email = user.emails[0].address
   
    new SimpleSchema({
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email
      }
    }).validate({email})

    return true
  })
 
