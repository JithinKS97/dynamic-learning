import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const Comments = new Mongo.Collection('comments');

if (Meteor.isServer) {
    Meteor.publish('comments', () => Comments.find());
}

Meteor.methods({
    'comments.insert': function (content, userid, lessonid) {
        if (!this.userId) {
            throw new Meteor.Error('not-authorized'); 
        }
        Comments.insert({
            content, 
            userid, 
            lessonid, 
            date: Date.now()
        }); 
    }
})

export default Comments; 