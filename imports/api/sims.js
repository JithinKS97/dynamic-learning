import {Mongo} from 'meteor/mongo'
import {Meteor} from 'meteor/meteor'

export const Sims = new Mongo.Collection('sims')

if(Meteor.isServer) {

    Meteor.publish('sims',function(){
        return Sims.find()
    })
}

Meteor.methods({
    'sims.insert'(name, iframe) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        Sims.insert({name,iframe})
    }
})
