/* eslint-disable object-shorthand, meteor/audit-argument-checks */
import { Mongo } from 'meteor/mongo';
import moment from 'moment';
import { Index, MongoDBEngine } from 'meteor/easy:search';

export const Lessons = new Mongo.Collection('lessons');

export const LessonsIndex = new Index({
  collection: Lessons,
  fields: ['title'],
  engine: new MongoDBEngine({
    selector(searchObject, options, aggregation) {
      // selector contains the default mongo selector that Easy Search would use
      const selector = this.defaultConfiguration().selector(searchObject, options, aggregation);

      // modify the selector to only match documents
      selector.shared = true;
      selector.isFile = true;

      return selector;
    },
  }),
});


if (Meteor.isServer) {
  Meteor.publish('lessons', function () { // eslint-disable-line func-names
    return Lessons.find({ userId: this.userId });
  });

  Meteor.publish('lessons.public', function () { // eslint-disable-line func-names, prefer-arrow-callback
    return Lessons.find({ shared: true });
  });
}

Meteor.methods({
  'lessons.insert'(title) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const newSlide = {
      url: null,
      iframes: [],
      comments: [],
    };

    const slides = [];

    slides.push(newSlide);

    Lessons.insert({
      userId: this.userId,
      slides,
      title,
      isFile: true,
      parent_id: '0',
      shared: false,
      updatedAt: moment().valueOf(),
      createdAt: Date.now(),
      upvotes: [], // will contain IDs of users who upvoted
      downvotes: [],
      members: [this.userId],
    });
  },

  'lessons.folder.insert'(title) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Lessons.insert({
      userId: this.userId,
      title,
      isFile: false,
      parent_id: '0',
      expanded: false,
      children: [],
      updatedAt: moment().valueOf(),
    });
  },

  'lessons.addMember'(_id) {
    Lessons.update(
      { _id, members: { $nin: [this.userId] } },
      { $push: { members: this.userId } },
    );
  },

  'lessons.directoryChange'(_id, parent_id) { // eslint-disable-line camelcase
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Lessons.update({ _id }, { $set: { parent_id } });
  },

  'lessons.folder.visibilityChange'(_id, expanded) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Lessons.update({ _id }, { $set: { expanded } });
  },
  
  'lessons.folder.nameUpdate'(_id, tags) {
    Lessons.update({ _id }, { $set: { title: tags } });
  },

  'lessons.remove'(_id) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Lessons.remove({ _id });
  },

  'lessons.update'(_id, slides, operation, args) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    let lesson;
    switch (operation) {
      case 'memberOp':
        Lessons.update(
          { _id },
          { $set: { slides, updatedAt: moment().valueOf() } },
        );
        break;
      case 'ownerOp':
        Lessons.update(
          { _id, userId: this.userId },
          { $set: { slides, updatedAt: moment().valueOf() } },
        );
        break;
      case 'editComment':
        lesson = Lessons.findOne({ _id });
        // Only owner of the comment allowed to perform this
        // args._id is the ID of the comment to be edited
        // comment.userId === this.userId
        if (
          lesson
            .slides[args.curSlide]
            .comments
          // The comment is found out by matching ids
            .filter(comment => comment._id === args._id)[0]
          // ownership of comment is checked
            .userId === this.userId
        ) {
          Lessons.update(
            { _id },
            { $set: { slides, updatedAt: moment().valueOf() } },
          );
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      case 'editReply':
        // same as editComment function
        lesson = Lessons.findOne({ _id });
        if (
          lesson
            .slides[args.curSlide]
            .comments
            .filter(comment => comment._id === args.commentId)[0]
            .replies
            .filter(reply => reply._id === args.replyId)[0]
            .userId === this.userId
        ) {
          Lessons.update(
            { _id, members: { $in: [this.userId] } },
            { $set: { slides, updatedAt: moment().valueOf() } },
          );
        } else {
          throw new Meteor.Error('not-authorized');
        }
        break;
      default:
    }
  },

  'lessons.upvote'(lessonid, userid) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (Lessons.findOne({ _id: lessonid }).upvotes.includes(userid)) {
      Lessons.update(
        { _id: lessonid },
        { $pull: { upvotes: userid } },
      );
      return;
    }
    if (Lessons.findOne({ _id: lessonid }).downvotes.includes(userid)) {
      Lessons.update(
        { _id: lessonid },
        { $pull: { downvotes: userid } },
      );
    }
    Lessons.update(
      { _id: lessonid },
      { $push: { upvotes: userid } },
    );
  },

  'lessons.downvote'(lessonid, userid) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (Lessons.findOne({ _id: lessonid }).downvotes.includes(userid)) {
      Lessons.update(
        { _id: lessonid },
        { $pull: { downvotes: userid } },
      );
      return;
    }
    if (Lessons.findOne({ _id: lessonid }).upvotes.includes(userid)) {
      Lessons.update(
        { _id: lessonid },
        { $pull: { upvotes: userid } },
      );
    }
    Lessons.update(
      { _id: lessonid },
      { $push: { downvotes: userid } },
    );
  },

  'lessons.shareLesson'(_id, shared) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Lessons.update(
      { _id, userId: this.userId },
      { $set: { shared, updatedAt: moment().valueOf() } },
    );
  },

  'lessons.addupdown'(_id) {
    Lessons.update({ _id }, { $set: { upvotes: [], downvotes: [] } });
  },
});
