import { Mongo } from 'meteor/mongo'
import moment from 'moment'
import SimpleSchema from 'simpl-schema'

export const Requests = new Mongo.Collection('requests')


if(Meteor.isServer) {

    Meteor.publish('requests',function(){
        return Requests.find()
    })
}

Meteor.methods({

    'requests.update'(_id, slides) {

        if(!this.userId) {

            throw new Meteor.Error('not-authorized')
        }

        // new SimpleSchema({

        //     _id: {
        //         type: String,
        //         min:1
        //     }

        // }).validate({_id})


        // new SimpleSchema({

        //     title: {
        //         type: String,
        //         optional:true
        //     },

        //     comments: {
        //         type:Array,
        //         optional: true,
        //     },

        //     'comments.$':{type:Object},
        //     'comments.$.comment':{type:String},
        //     'comments.$.userId':{type:String},
        //     'comments.$.time':{type:Number},

        //     iframes: {
        //         type:Array,
        //         optional: true,
        //     },

        //     'iframes.$':{type:Object},
        //     'iframes.$.src':{type:String},
        //     'iframes.$.w':{type:String},
        //     'iframes.$.h':{type:String},
        //     'iframes.$.x':{type:Number},
        //     'iframes.$.y':{type:Number},
        //     'iframes.$.userId':{type:String},
        //     'iframes.$.title':{type:String},
        //     'iframes.$.linkToCode':{type:String}


        // }).validate(slides)

        Requests.update({_id}, {$set:{slides,  updatedAt: moment().valueOf()}})
    },

    'requests.reset'(_id) {
        

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        Requests.update({_id, userId:this.userId}, {$set: {requestTitle:'',slides:[], updatedAt: moment().valueOf()}})
    }, 

    'requests.title.update'(_id, requestTitle) {

        if(!this.userId) {
            
            throw new Meteor.Error('not-authorized')
        }

        new SimpleSchema({

            _id: {
                type: String,
                min:1
            },
            requestTitle: {
                type: String,
                optional:true
            }

        }).validate({_id, requestTitle})
                
        Requests.update({_id, userId:this.userId}, {$set: {requestTitle, updatedAt: moment().valueOf()}})
    }
    
})
