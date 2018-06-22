import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { Requests} from './requests'
import SimpleSchema from 'simpl-schema'
import moment from 'moment'
 
export const LessonPlans = new Mongo.Collection('lessonplans')

if(Meteor.isServer) {

    Meteor.publish('lessonplans',function(){
        return LessonPlans.find({userId:this.userId})
    })
}

Meteor.methods({

    'lessonplans.insert'(title) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        return LessonPlans.insert({


            /* There will be a Request document for each Lessonplan document.
                It is created along with Lessonplan document.
                So it is given the same id as the Lessonplan document, docs is the
                id of the inserted LessonPlan document.
            */
                        
            title,
            slides:[],
            userId:this.userId,
            updatedAt: moment().valueOf(),
            isFile:true,
            isPublic:false,
            parent_id:'0'

        },(err, docs)=>{

            Requests.insert({

                userId:this.userId, 
                _id:docs, 
                slides:[], 
                requestTitle:'',
                updatedAt: moment().valueOf()
            })

        })
    },

    'lessonplans.folder.insert'(title) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        return LessonPlans.insert({ 
            
            userId:this.userId,
            title,
            isFile:false,
            parent_id:'0',
            children:[],
            expanded:false

        })
    },

    'lessonplans.remove'(_id) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        new SimpleSchema({
            _id: {
                type: String,
                min: 1
            }
        }).validate({_id})

        LessonPlans.remove({_id, userId:this.userId})
        Requests.remove({_id, userId:this.userId})
    },

    'lessonplans.directoryChange'(_id, parent_id) {
        
        LessonPlans.update({_id}, {$set:{parent_id}})
    },

    'lessonplans.folder.visibilityChange'(_id, expanded) {

        LessonPlans.update({_id}, {$set:{expanded}})
    },

    'lessonplans.update'(_id, slides) {

        if(!this.userId) {

            throw new Meteor.Error('not-authorized')
        }

        new SimpleSchema({

            _id: {
                type: String,
                min:1
            }

        }).validate({_id})


        new SimpleSchema({

            note: {
                type: String,
                optional:true
            },

            iframes: {
                type:Array,
                optional: true,
            },

            'iframes.$':{type:Object, blackbox:true}


        }).validate(slides)
        
        LessonPlans.update({_id, userId:this.userId}, {$set:{slides, updatedAt: moment().valueOf()}})
    }
})

