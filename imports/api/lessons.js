import { Mongo } from 'meteor/mongo'
import moment from 'moment'
import { Index, MongoDBEngine } from 'meteor/easy:search'
 
export const Lessons = new Mongo.Collection('lessons')

export const LessonsIndex = new Index({
    collection: Lessons,
    fields: ['title'],
    engine: new MongoDBEngine({
        selector: function (searchObject, options, aggregation) {
            // selector contains the default mongo selector that Easy Search would use
            let selector = this.defaultConfiguration().selector(searchObject, options, aggregation)

            // modify the selector to only match documents
            selector.shared = true
            selector.isFile = true

            return selector
        }
    })

})


if(Meteor.isServer) {

    Meteor.publish('lessons', function() {

        return Lessons.find({userId:this.userId})
    })

    Meteor.publish('lessons.public',function(){

        return Lessons.find({shared:true})
    })
}

Meteor.methods({

    'lessons.insert'(title) {

        const newSlide = {

            url:null,
            iframes:[]
        }

        const slides = []

        slides.push(newSlide)

        Lessons.insert({

            userId:this.userId,
            slides,
            title,
            isFile: true,
            parent_id:'0',
            shared: false,
            updatedAt: moment().valueOf()
        })
    },

    'lessons.folder.insert'(title) {

        Lessons.insert({

            title,
            isFile: false,
            parent_id:'0',
            expanded:false,
            children:[],
            updatedAt: moment().valueOf()
        })
    },'lessons.directoryChange'(_id, parent_id) {
        
        Lessons.update({_id}, {$set:{parent_id}})
    },

    'lessons.folder.visibilityChange'(_id, expanded) {

        Lessons.update({_id}, {$set:{expanded}})
    },
    'lessons.remove'(_id) {

        Lessons.remove({_id})
    },

    'lessons.update'(_id, slides) {

        Lessons.update({_id, userId:this.userId}, {$set:{slides, updatedAt: moment().valueOf()}})
    },
    'lessons.shareLesson'(_id, shared) {
        console.log(shared)
        Lessons.update({_id, userId:this.userId}, {$set:{shared, updatedAt: moment().valueOf()}})
    }

})