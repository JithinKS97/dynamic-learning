import { Mongo } from 'meteor/mongo'

export const Requests = new Mongo.Collection('requests')


if(Meteor.isServer) {

    Meteor.publish('requests',function(){
        return Requests.find()
    })
}
