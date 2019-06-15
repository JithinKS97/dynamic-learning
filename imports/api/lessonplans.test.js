import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { LessonPlans } from './lessonplans';
import { Requests } from './requests';

if (Meteor.isServer) {
  describe('Lessonplans', () => {
    const lessonplanOne = {
      _id: 'testLessonPlanId1',
      name: 'first lessonplan',
      userId: 'testUserId1',
      slides: [{
        note: 'sampleData',
        iframes: [{
          data: {},
          src: 'sample1',
          w: '50',
          h: '50',
        }],
      }],
      updatedAt: 0,
    };

    const lessonplanTwo = {
      _id: 'testLessonPlanId2',
      name: 'another lessonplan',
      userId: 'testUserId2',
      slides: [{
        note: 'sampleData',
        iframes: [{
          data: {},
          src: 'sample1',
          w: '50',
          h: '50',
        }],
      }],
      updatedAt: 0,
    };


    beforeEach(() => {
      LessonPlans.remove({});
      LessonPlans.insert(lessonplanOne);
      LessonPlans.insert(lessonplanTwo);
    });


    it('should not insert a lessonplan if not authenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['lessonplans.insert']();
      }).to.throw();
    });


    it('should insert a lessonplan and its request if authenticated', () => {
      const { userId } = lessonplanOne;
      const _id = Meteor.server.method_handlers['lessonplans.insert'].apply({ userId }, ['title-1']);

      expect(LessonPlans.findOne({ _id, userId }).title).to.equal('title-1');
    });


    it('should remove lessonplan and its request if authenticated', () => {
      Meteor.server.method_handlers['lessonplans.remove'].apply({ userId: lessonplanOne.userId }, [lessonplanOne._id]);
      expect(LessonPlans.findOne({ _id: lessonplanOne._id })).to.equal(null);
      expect(Requests.findOne({ _id: lessonplanOne._id })).to.equal(null);
    });


    it('should not remove lessonplan if not authenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['lessonplans.remove'].apply({}, [lessonplanOne._id]);
      }).to.throw();
    });


    it('should not remove lessonplan if id is invalid', () => {
      expect(() => {
        Meteor.server.method_handlers['lessonplans.remove'].apply({ userId: lessonplanOne.userId });
      }).to.throw();
    });


    it('should update lessonplan', () => {
      const slides = [{
        note: 'updatedData',
        iframes: [{
          data: {},
          src: 'sample1',
          w: '50',
          h: '50',
        }],
      }];
      Meteor.server.method_handlers['lessonplans.update'].apply({ userId: lessonplanOne.userId }, [lessonplanOne._id, slides]);
      const lessonplan = LessonPlans.findOne(lessonplanOne._id);
      expect(lessonplan.updatedAt).to.be.greaterThan(0);
      expect(lessonplan).to.deep.include({ slides, name: lessonplanOne.name });
    });


    it('should not update if user was not creator', () => {
      const slides = [{
        note: 'updatedData',
        iframes: [{
          data: {},
          src: 'sample1',
          w: '50',
          h: '50',
        },
        {
          data: {},
          src: 'sample2',
          w: '100',
          h: '100',
        }],
      }];
      Meteor.server.method_handlers['lessonplans.update'].apply({ userId: 'invalidId' }, [lessonplanOne._id, slides]);
      const lessonplan = LessonPlans.findOne(lessonplanOne._id);
      expect(lessonplan).to.deep.include(lessonplanOne);
    });


    it("should return a user's lessonplan", () => {
      const res = Meteor.server.publish_handlers.lessonplans.apply({
        userId: lessonplanOne.userId,
      });
      const lessonplans = res.fetch();
      expect(lessonplans.length).to.equal(1);
      expect(lessonplans[0]).to.deep.include(lessonplanOne);
    });


    it('should return 0 lessonplan for user that has none', () => {
      const res = Meteor.server.publish_handlers.lessonplans.apply({ userId: 'testId' });
      const lessonplans = res.fetch();
      expect(lessonplans.length).to.equal(0);
    });
  });
}
