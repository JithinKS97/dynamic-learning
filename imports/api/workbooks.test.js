import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Workbooks } from './workbooks';
import { Requests } from './requests';

if (Meteor.isServer) {
  describe('Workbooks', () => {
    const workbookOne = {
      _id: 'testWorkbookId1',
      name: 'first workbook',
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

    const workbookTwo = {
      _id: 'testWorkbookId2',
      name: 'another workbook',
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
      Workbooks.remove({});
      Workbooks.insert(workbookOne);
      Workbooks.insert(workbookTwo);
    });


    it('should not insert a workbook if not authenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['workbooks.insert']();
      }).to.throw();
    });


    it('should insert a workbook and its request if authenticated', () => {
      const { userId } = workbookOne;
      const _id = Meteor.server.method_handlers['workbooks.insert'].apply({ userId }, ['title-1']);

      expect(Workbooks.findOne({ _id, userId }).title).to.equal('title-1');
    });

    it('should remove workbook and its request if authenticated', () => {
      Meteor.server.method_handlers['workbooks.remove'].apply({ userId: workbookOne.userId }, [workbookOne._id]);
      expect(Workbooks.findOne({ _id: workbookOne._id })).to.equal(undefined);
      expect(Requests.findOne({ _id: workbookOne._id })).to.equal(undefined);
    });

    it('should not remove workbook if not authenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['workbooks.remove'].apply({}, [workbookOne._id]);
      }).to.throw();
    });

    it('should not remove workbook if id is invalid', () => {
      expect(() => {
        Meteor.server.method_handlers['workbooks.remove'].apply({ userId: workbookOne.userId });
      }).to.throw();
    });

    it('should update workbook', () => {
      const slides = [{
        note: 'updatedData',
        iframes: [{
          data: {},
          src: 'sample1',
          w: '50',
          h: '50',
        }],
      }];
      Meteor.server.method_handlers['workbooks.update'].apply({ userId: workbookOne.userId }, [workbookOne._id, slides]);
      const workbook = Workbooks.findOne(workbookOne._id);
      expect(workbook.updatedAt).to.be.greaterThan(0);
      expect(workbook).to.deep.include({ slides, name: workbookOne.name });
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
      Meteor.server.method_handlers['workbooks.update'].apply({ userId: 'invalidId' }, [workbookOne._id, slides]);
      const workbook = Workbooks.findOne(workbookOne._id);
      expect(workbook).to.deep.include(workbookOne);
    });


    it("should return a user's workbook", () => {
      const res = Meteor.server.publish_handlers.workbooks.apply({
        userId: workbookOne.userId,
      });
      const workbooks = res.fetch();
      expect(workbooks.length).to.equal(1);
      expect(workbooks[0]).to.deep.include(workbookOne);
    });


    it('should return 0 workbook for user that has none', () => {
      const res = Meteor.server.publish_handlers.workbooks.apply({ userId: 'testId' });
      const workbooks = res.fetch();
      expect(workbooks.length).to.equal(0);
    });
  });
}
