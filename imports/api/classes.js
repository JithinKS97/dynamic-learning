/* eslint-disable object-shorthand */
/* eslint-disable space-before-function-paren */
/* eslint-disable meteor/audit-argument-checks */
/* eslint-disable func-names */
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

const Classes = new Mongo.Collection('classes');

if (Meteor.isServer) {
  Meteor.publish('classes', () => Classes.find());
}

Meteor.methods({
  'classes.insert': function (classcode, name, instructor) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Classes.insert({
      classcode,
      name,
      instructor,
      roster: [],
      lessons: [],
    });
    Meteor.call('users.addClass', instructor, classcode);
  },

  'classes.addstudent': function (classcode, studentname) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Classes.update(
      { classcode },
      { $push: { roster: studentname } },
      (err) => {
        if (!err) {
          Meteor.call('users.addClass', studentname, classcode);
        }
      },
    );
  },

  'classes.addlesson': function(classcode, lessonid) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Classes.update(
      { classcode, lessons: { $nin: [lessonid] } },
      { $push: { lessons: lessonid } },
    );
  },
  'classes.removeLesson': function(classcode, lessonid) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    Classes.update(
      { classcode, lessons: { $in: [lessonid] } },
      { $pull: { lessons: lessonid } },
    );
  },
  'classes.remove'(cl) {
    Classes.remove({ classcode: cl.classcode }, (err) => {
      if (!err) {
        Meteor.call('users.deleteClass', cl.instructor, cl.classcode);
        cl.roster.map((r) => {
          Meteor.call('users.deleteClass', r, cl.classcode);
        });
      }
    });
  },
});

export default Classes;
