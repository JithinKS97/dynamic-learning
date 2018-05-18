import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const LessonPlans = new Mongo.Collection('lessonplans')

if(Meteor.isServer) {

    Meteor.publish('lessonplans',function(){
        return LessonPlans.find({userId:this.userId})
    })
}

Meteor.methods({

    'lessonplans.update'(id, slides) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        LessonPlans.update(id, {$set:{slides}})
    }
})

