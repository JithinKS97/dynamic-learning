import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const LessonPlans = new Mongo.Collection('lessonplans')

if(Meteor.isServer) {

    Meteor.publish('lessonplans',function(){
        return LessonPlans.find({userId:this.userId})
    })
}

