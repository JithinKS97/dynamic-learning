import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Sims = new Mongo.Collection('sims')

if(Meteor.isServer) {

    Meteor.publish('sims',function(){
        return Sims.find({userId:this.userId})
    })

    Meteor.publish('sims.public',function(){
        
        return Sims.find({isPublic:true})
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
            isAdded:false,
            isPublic:false
        })
    },

    'sims.directoryChange'(_id, isAdded) {
        Sims.update({_id}, {$set:{isAdded}})
    },

    'sims.visibilityChange'(_id, isPublic) {
        Sims.update({_id}, {$set:{isPublic}})
    },

    
    'sims.remove'(_id) {

        Sims.remove({_id, userId:this.userId})
    }
})