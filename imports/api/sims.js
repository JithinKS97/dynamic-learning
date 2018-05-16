import {Mongo} from 'meteor/mongo'

export const Sims = new Mongo.Collection('sims')

if(Meteor.isServer) {

    Meteor.publish('sims',function(){
        return Sims.find()
    })
}
