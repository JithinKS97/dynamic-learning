/* eslint-disable space-before-function-paren */
/* eslint-disable meteor/audit-argument-checks */
/* eslint-disable func-names */
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const Questions = new Mongo.Collection('questions');

if (Meteor.isServer) {
  Meteor.publish('questions', () => Questions.find());
}

/*
    The structure for a question is as follows:
    {
        content: String,
        type: String, (for now, multiple choice or short response)
        a: String,
        b: String,
        c: String,
        d: String,
        answer: String
    }
*/

Meteor.methods({
  'questions.insert': function(question) {
    Questions.insert(question);
  },
});

export default Questions;
