import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

export const Sims = new Mongo.Collection('sims')

if(Meteor.isServer) {

    Meteor.publish('sims',function(){
        
        return Sims.find({userId:this.userId})
    })

    Meteor.publish('sims.public',function(){
        
        return Sims.find({isPublic:true})
    })
}

Meteor.methods({    

    'sims.insert'(title, src, w, h, linkToCode) {

        if(!this.userId) {

            throw new Meteor.Error('not-authorized')
        }

        return Sims.insert({ 
            
            userId:this.userId,
            title, 
            src, 
            w, 
            h,
            isFile:true,
            isPublic:false,
            parent_id:'0',
            linkToCode
        })
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

        Sims.update({_id}, {$set:{parent_id}})
    },

    'sims.visibilityChange'(_id, isPublic) {
        
        Sims.update({_id}, {$set:{isPublic}})
    },

    'sims.folder.visibilityChange'(_id, expanded) {

        Sims.update({_id}, {$set:{expanded}})
    },
    
    'sims.remove'(_id) {

        Sims.remove({_id, userId:this.userId})
    },

    'sims.titleChange'(_id, title) {

        Sims.update({_id}, {$set:{title}})
    }
})