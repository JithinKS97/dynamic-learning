import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Requests } from './requests';

if (Meteor.isServer) {
  describe('Requests', () => {
    const requestOne = {
      _id: 'requestId1',
      requestTitle: 'testTitle',
      userId: 'testUserId1',
      slides: [{
        title: 'testTitle',
        comments: [{
          comment: 'testComment',
          userId: this.userId,
          username: 'testUsername1',
          time: 0,
        }],
        iframes: [{
          src: 'sample1',
          userId: this.userId,
          w: '50',
          h: '50',
          x: 0,
          y: 0,
        }],
      }],
      updatedAt: 0,
    };

    const requestTwo = {
      _id: 'requestId2',
      requestTitle: 'testTitle',
      userId: 'testUserId2',
      slides: [{
        title: 'testTitle',
        comments: [{
          comment: 'testComment',
          userId: this.userId,
          username: 'testUsername2',
          time: 0,
        }],
        iframes: [{
          src: 'sample1',
          userId: this.userId,
          w: '50',
          h: '50',
          x: 0,
          y: 0,
        }],
      }],
      updatedAt: 0,
    };


    beforeEach(() => {
      Requests.remove({});
      Requests.insert(requestOne);
    });


    it('should update requests if authenticated', () => {
      const slides = [{
        comments: [
          {
            comment: 'testComment',
            userId: requestOne.userId,
            username: 'testUsername',
            time: 0,
          },
          {
            userId: requestOne.userId,
            comment: 'testComment2',
            username: 'testUsername2',
            time: 5,
          },
        ],
        iframes: [{
          userId: requestOne.userId,
          src: 'sample1',
          w: '50',
          h: '50',
          x: 0,
          y: 0,
        }],
      }];
      Meteor.server.method_handlers['requests.update'].apply({ userId: requestTwo.userId }, [requestOne._id, slides]);
      const request = Requests.findOne(requestOne._id);
      expect(request.updatedAt).to.be.greaterThan(0);
      expect(request).to.deep.include({ slides });
    });


    it('should update title if authenticated', () => {
      const requestTitle = 'updatedTitle';
      Meteor.server.method_handlers['requests.title.update'].apply({ userId: requestOne.userId }, [requestOne._id, requestTitle]);
      const request = Requests.findOne(requestOne._id);
      expect(request.updatedAt).to.be.greaterThan(0);
      expect(request).to.deep.include({ requestTitle });
    });


    it('should not update requestTitle if not authenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['requests.title.update'].apply({}, [requestOne._id]);
      }).to.throw();
    });
  });
}
