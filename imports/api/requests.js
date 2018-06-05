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

        new SimpleSchema({

            _id: {
                type: String,
                min:1
            }

        }).validate({_id})

        new SimpleSchema({

            title: {
                type:String,
                optional: true
            },

            iframes: {
                type:Array,
                optional: true
            },

            'iframes.$':{type:Object, blackbox:true},

            comments: {
                type:Array,
                optional: true
            },

            'comments.$':Object,
            'comments.$.comment':String,
            'comments.$.username':String,
            'comments.$.userId':String,
            'comments.$.time':Number

        }).validate(slides)

        new SimpleSchema({

            _id: {
                type: String,
                min:1
            }

        }).validate({_id})

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
