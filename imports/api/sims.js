import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'
import { Index, MongoDBEngine } from 'meteor/easy:search'

export const Sims = new Mongo.Collection('sims')

export const SimsIndex = new Index({
    collection: Sims,
    fields: ['title', 'tags'],
    engine: new MongoDBEngine({
        selector: function (searchObject, options, aggregation) {
            // selector contains the default mongo selector that Easy Search would use
            let selector = this.defaultConfiguration().selector(searchObject, options, aggregation)
      
            // modify the selector to only match documents
            selector.isPublic = true
            selector.isFile = true
      
            return selector
        },
        sort: () => { title: -1 }
    })
})

if(Meteor.isServer) {

    Meteor.publish('sims',function(){
        
        return Sims.find({userId:this.userId})
    })

    Meteor.publish('sims.public',function(){
        
        return Sims.find({isPublic:true})
    })
}

Meteor.methods({    

    'sims.insert'(title, username, project_id, w, h) {

        if(!this.userId) {

            throw new Meteor.Error('not-authorized')
        }

        return Sims.insert({ 
            
            userId:this.userId,
            title, 
            username,
            project_id, 
            w, 
            h,
            isFile:true,
            isPublic:false,
            parent_id:'0',
            tags:[]
        })
    },
    'sims.tagsChange'(_id, tags) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        Sims.update({_id}, {$set:{tags}})
    },

    'sims.folder.insert'(title) {

        if(!this.userId) {

            throw new Meteor.Error('not-authorized')
        }

        Sims.insert({ 
            
            userId:this.userId,
            title,
            isFile:false,
            parent_id:'0',
            children:[],
            expanded:false

        })
    },

    'sims.folderChange'(_id, parent_id) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        Sims.update({_id}, {$set:{parent_id}})
    },

    'sims.visibilityChange'(_id, isPublic) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }
        
        Sims.update({_id}, {$set:{isPublic}})
    },

    'sims.folder.visibilityChange'(_id, expanded) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        Sims.update({_id}, {$set:{expanded}})
    },
    
    'sims.remove'(_id) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        Sims.remove({_id, userId:this.userId})
    },

    'sims.titleChange'(_id, title) {

        if(!this.userId) {
            throw new Meteor.Error('not-authorized')
        }

        Sims.update({_id}, {$set:{title}})
    }
})