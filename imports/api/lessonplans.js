import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { Requests} from './requests'
import SimpleSchema from 'simpl-schema'
import moment from 'moment'
import { Index, MongoDBEngine } from 'meteor/easy:search'
 
export const LessonPlans = new Mongo.Collection('lessonplans')

export const LessonPlansIndex = new Index({
    collection: LessonPlans,
    fields: ['title'],
    engine: new MongoDBEngine({
        selector: function (searchObject, options, aggregation) {
            // selector contains the default mongo selector that Easy Search would use
            let selector = this.defaultConfiguration().selector(searchObject, options, aggregation)
      
            // modify the selector to only match documents where region equals "New York"
            selector.isPublic = true
            selector.isFile = true
      
            return selector
        }
    })
    
})

if(Meteor.isServer) {

    Meteor.publish('lessonplans',function(){
        return LessonPlans.find({userId:this.userId})
    })

    Meteor.publish('lessonplans.public',function(){
        
        return LessonPlans.find({isPublic:true})
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
    },

    'lessonplans.updateTitle'(_id, title) {
        
        LessonPlans.update({_id, userId:this.userId}, {$set:{title, updatedAt: moment().valueOf()}})
    },

    'lessonplans.visibilityChange'(_id, isPublic) {
        
        LessonPlans.update({_id}, {$set:{isPublic}})
    },
})

