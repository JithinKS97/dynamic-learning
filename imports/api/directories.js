import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Directories = new Mongo.Collection('directories')

if(Meteor.isServer) {

    Meteor.publish('directories',function(){
        return Directories.find()
    })
}

Meteor.methods({

    'directories.insert'() {

        Directories.insert({

            _id:this.userId,
            directories:[]
        })

    },

    'directories.update'(_id, directories) {

        Directories.update({_id}, {$set:{directories}})

    }

})