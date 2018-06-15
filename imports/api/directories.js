import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Directories = new Mongo.Collection('directories')

if(Meteor.isServer) {

    Meteor.publish('directories',function(){
        return Directories.find({_id:this.userId})
    })
}

Meteor.methods({

    'directories.insert'() {

        Directories.insert({

            _id:this.userId,
            lessonPlanDirectories:[],
            simDirectories:[]
        })

    },

    'lessonPlanDirectories.update'(_id, lessonPlanDirectories) {

        Directories.update({_id}, {$set:{lessonPlanDirectories}})

    },

    'simDirectories.update' (_id, simDirectories) {

        Directories.update({_id}, {$set:{simDirectories}})
    }

})