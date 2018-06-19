import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Sims = new Mongo.Collection('sims')

if(Meteor.isServer) {

    Meteor.publish('sims',function(){
        return Sims.find({userId:this.userId})
    })
}

Meteor.methods({    

    'sims.insert'(name, src, w, h) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        return Sims.insert({ 
            
            userId:this.userId,
            name, 
            src, 
            w, 
            h,
            parent_id:null
        })
    },

    'sims.directoryChange'(_id, parent_id) {
        Sims.update({_id}, {$set:{parent_id}})
    }, 

    
    'sims.remove'(_id) {

        Sims.remove({_id, userId:this.userId})
    }
})
