import { Mongo } from 'meteor/mongo'

export const Requests = new Mongo.Collection('requests')


if(Meteor.isServer) {

    Meteor.publish('requests',function(){
        return Requests.find()
    })
}

Meteor.methods({

    'requests.update'(_id, slides) {
        Requests.update(_id, {$set:{slides}})
    },

    'requests.title.update'(_id, requestTitle) {
                
        Requests.update(_id, {$set: {requestTitle}})
    }
    
})
