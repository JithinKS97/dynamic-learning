/* eslint-disable space-before-function-paren */
/* eslint-disable meteor/audit-argument-checks */
/* eslint-disable func-names */
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const Tests = new Mongo.Collection('assessments');

if (Meteor.isServer) {
  Meteor.publish('assessments', () => Tests.find());
}

Meteor.methods({
  'assessments.insert': function(title) {
    Tests.insert({ title, questions: [] });
  },
  'assessments.addquestion': function(_id, question) {
    Tests.update({ _id }, { $push: { questions: question } });
  },
});

export default Tests;
