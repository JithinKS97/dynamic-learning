import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { Requests} from './requests'
 
export const LessonPlans = new Mongo.Collection('lessonplans')

if(Meteor.isServer) {

    Meteor.publish('lessonplans',function(){
        return LessonPlans.find({userId:this.userId})
    })
}

Meteor.methods({

    'lessonplans.insert'(name) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        LessonPlans.insert({
                        
            name,
            slides:[],
            userId:Meteor.userId()

        },(err, docs)=>{

            Requests.insert({_id:docs, slides:[]})

        })
    },

    'lessonplans.remove'(_id) {
        LessonPlans.remove(_id)
        Requests.remove(_id)
    },

    'lessonplans.update'(_id, slides) {
        LessonPlans.update(_id, {$set:{slides}})
    }
})

