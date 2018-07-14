import { Mongo } from 'meteor/mongo'
 
export const Lessons = new Mongo.Collection('lessons')


if(Meteor.isServer) {

    Meteor.publish('lessons', function() {

        return Lessons.find()
    })
}

Meteor.methods({

    'lessons.insert'(title) {

        Lessons.insert({

            title,
            isFile: true,
            parent_id:'0'
        })
    },

    'lessons.folder.insert'(title) {

        Lessons.insert({

            title,
            isFile: false,
            parent_id:'0',
            expanded:false
        })
    },'lessons.directoryChange'(_id, parent_id) {
        
        Lessons.update({_id}, {$set:{parent_id}})
    },

    'lessons.folder.visibilityChange'(_id, expanded) {

        Lessons.update({_id}, {$set:{expanded}})
    },
    'lessons.remove'(_id) {

        Lessons.remove({_id})
    }

})