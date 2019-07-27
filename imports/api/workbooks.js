/* eslint-disable object-shorthand */
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';
import { Index, MongoDBEngine } from 'meteor/easy:search';
import { Requests } from './requests';

export const Workbooks = new Mongo.Collection('workbooks');

export const WorkbooksIndex = new Index({
  collection: Workbooks,
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
  Meteor.publish('workbooks', function () { // eslint-disable-line func-names
    return Workbooks.find({
      $or: [{ userId: this.userId }, { isPublic: true }],
    });
  });

  Meteor.publish('workbooks.public', function () { // eslint-disable-line func-names, prefer-arrow-callback
    return Workbooks.find({ isPublic: true });
  });
}

Meteor.methods({
  'workbooks.insert'(title) { // eslint-disable-line
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(title, String);
    if (title.length < 0) {
      throw new Meteor.Error('Title cannot be empty!');
    }

    return Workbooks.insert(
      {
        /* There will be a Request document for each Workbook document.
                It is created along with Workbook document.
                So it is given the same id as the Workbook document, docs is the
                id of the inserted Workbook document.
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
          createdAt: null,
          description: '',
          members: [this.userId],
          pendingRequests: [],
          allMembers: [this.userId],
        });
      },
    );
  },

  'workbooks.tagsChange'(_id, tags) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(_id, String);
    check(tags, Array);

    Workbooks.update({ _id }, { $set: { tags } });
  },
  'workbooks.folder.nameUpdate'(_id, tags) {
      
    Workbooks.update({ _id }, { $set: { title:tags } });
  },

  'workbooks.folder.insert'(title) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(title, String);
    if (title.length < 0) {
      throw new Meteor.Error('Title cannot be empty!');
    }

    return Workbooks.insert({
      userId: this.userId,
      title,
      isFile: false,
      parent_id: '0',
      children: [],
      expanded: false,
    });
  },

  'workbooks.remove'(_id) { // eslint-disable-line object-shorthand
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

    Workbooks.remove({ _id, userId: this.userId });
    Requests.remove({ _id, userId: this.userId });
  },

  'workbooks.directoryChange'(_id, parent_id) { // eslint-disable-line object-shorthand, camelcase
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(_id, String);
    check(parent_id, String);

    Workbooks.update({ _id }, { $set: { parent_id } });
  },

  'workbooks.folder.visibilityChange'(_id, expanded) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    check(_id, String);
    check(expanded, Boolean);
    Workbooks.update({ _id }, { $set: { expanded } });
  },

  'workbooks.update'(_id, slides) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    check(_id, String);
    check(slides, Array);
    Workbooks.update(
      { _id, userId: this.userId },
      { $set: { slides, updatedAt: moment().valueOf() } },
    );
  },

  'workbooks.updateTitle'(_id, title) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    check(_id, String);
    check(title, String);
    Workbooks.update(
      { _id, userId: this.userId },
      { $set: { title, updatedAt: moment().valueOf() } },
    );
  },

  'workbooks.visibilityChange'(_id, isPublic) { // eslint-disable-line object-shorthand
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    check(_id, String);
    check(isPublic, Boolean);

    Workbooks.update({ _id }, { $set: { isPublic } });
  },

  'workbooks.description'(_id, description) { // eslint-disable-line object-shorthand
    check(_id, String);
    check(description, String);
    Workbooks.update({ _id }, { $set: { description } });
  },

  'workbooks.removeDescription'(_id) { // eslint-disable-line object-shorthand
    check(_id, String);
    Workbooks.update({ _id }, { $set: { description: {} } });
  },

  'workbooks.addDescriptionField'(_id) { // eslint-disable-line object-shorthand
    check(_id, String);
    Workbooks.update({ _id }, { $set: { description: {} } });
  },
});
