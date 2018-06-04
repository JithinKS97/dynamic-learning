import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Sims = new Mongo.Collection('sims')

if(Meteor.isServer) {

    Meteor.publish('sims',function(){
        return Sims.find()
    })
}

Meteor.methods({

    'sims.insert'(name, src, w, h) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        return Sims.insert({userId:this.userId,name, src, w, h})
    }    
})
