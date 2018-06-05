import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Videos = new Mongo.Collection('videos')

if(Meteor.isServer) {

    Meteor.publish('videos',function(){
        return Videos.find()
    })
}

Meteor.methods({

    'videos.insert'(blob) {
        console.log(blob)
    }    
})
