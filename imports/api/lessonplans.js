/* eslint-disable object-shorthand */
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';
import { Index, MongoDBEngine } from 'meteor/easy:search';
import { Requests } from './requests';

export const LessonPlans = new Mongo.Collection('lessonplans');

export const LessonPlansIndex = new Index({
  collection: LessonPlans,
  fields: ['title', 'tags'],
  engine: new MongoDBEngine({
    selector(searchObject, options, aggregation) {
      // selector contains the default mongo selector that Easy Search would use
      const selector = this.defaultConfiguration().selector(
        searchObject,
        options,
        aggregation,
      );

      // modify the selector to only match documents
      selector.isPublic = true;
      selector.isFile = true;

      return selector;
    },
  }),
});

if (Meteor.isServer) {
  Meteor.publish('lessonplans', function () { // eslint-disable-line func-names
    return LessonPlans.find({
      $or: [{ userId: this.userId }, { isPublic: true }],
    });
  });

  Meteor.publish('lessonplans.public', function () { // eslint-disable-line func-names, prefer-arrow-callback
    return LessonPlans.find({ isPublic: true });
  });
}

Meteor.methods({
  'lessonplans.insert'(title) { // eslint-disable-line
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(title, String);
    if (title.length < 0) {
      throw new Meteor.Error('Title cannot be empty!');
    }

    return LessonPlans.insert(
      {
        /* There will be a Request document for each Lessonplan document.
                It is created along with Lessonplan document.
                So it is given the same id as the Lessonplan document, docs is the
                id of the inserted LessonPlan document.
            */

        title,
        slides: [],
        userId: this.userId,
        createdAt: Date.now(),
        updatedAt: moment().valueOf(),
        isFile: true,
        isPublic: false,
        parent_id: '0',
        tags: [],
        description: {},
      },
      (err, docs) => {
        Requests.insert({
          userId: this.userId,
          _id: docs,
          slides: [],
          requestTitle: '',
          updatedAt: moment().valueOf(),
          createdAt: Date.now(),
          description: '',
          members: [this.userId],
          pendingRequests: [],
          allMembers: [this.userId],
        });
      },
    );
  },

  'lessonplans.tagsChange'(_id, tags) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(_id, String);
    check(tags, Array);

    LessonPlans.update({ _id }, { $set: { tags } });
  },

  'lessonplans.folder.insert'(title) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(title, String);
    if (title.length < 0) {
      throw new Meteor.Error('Title cannot be empty!');
    }

    return LessonPlans.insert({
      userId: this.userId,
      title,
      isFile: false,
      parent_id: '0',
      children: [],
      expanded: false,
    });
  },

  'lessonplans.remove'(_id) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    check(_id, String);
    new SimpleSchema({
      _id: {
        type: String,
        min: 1,
      },
    }).validate({ _id });

    LessonPlans.remove({ _id, userId: this.userId });
    Requests.remove({ _id, userId: this.userId });
  },

  'lessonplans.directoryChange'(_id, parent_id) { // eslint-disable-line object-shorthand, camelcase
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(_id, String);
    check(parent_id, String);

    LessonPlans.update({ _id }, { $set: { parent_id } });
  },

  'lessonplans.folder.visibilityChange'(_id, expanded) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    check(_id, String);
    check(expanded, Boolean);
    LessonPlans.update({ _id }, { $set: { expanded } });
  },

  'lessonplans.update'(_id, slides) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    check(_id, String);
    check(slides, Array);
    LessonPlans.update(
      { _id, userId: this.userId },
      { $set: { slides, updatedAt: moment().valueOf() } },
    );
  },

  'lessonplans.updateTitle'(_id, title) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    check(_id, String);
    check(title, String);
    LessonPlans.update(
      { _id, userId: this.userId },
      { $set: { title, updatedAt: moment().valueOf() } },
    );
  },

  'lessonplans.visibilityChange'(_id, isPublic) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(_id, String);
    check(isPublic, Boolean);

    LessonPlans.update({ _id }, { $set: { isPublic } });
  },

  'lessonplans.description'(_id, description) { // eslint-disable-line object-shorthand
    check(_id, String);
    check(description, String);
    LessonPlans.update({ _id }, { $set: { description } });
  },

  'lessonplans.removeDescription'(_id) { // eslint-disable-line object-shorthand
    check(_id, String);
    LessonPlans.update({ _id }, { $set: { description: {} } });
  },

  'lessonplans.addDescriptionField'(_id) { // eslint-disable-line object-shorthand
    check(_id, String);
    LessonPlans.update({ _id }, { $set: { description: {} } });
  },
});
