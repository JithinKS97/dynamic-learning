/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { Sims } from './sims';

if (Meteor.isServer) {
  // eslint-disable-next-line no-undef, func-names, prefer-arrow-callback
  describe('Sims', function () {
    // eslint-disable-next-line no-undef, func-names, prefer-arrow-callback
    beforeEach(function () {
      Sims.remove({});
    });

    // eslint-disable-next-line no-undef, func-names, prefer-arrow-callback
    it('should insert a sim if authenticated', function () {
      const userId = 'testId';
      const _id = Meteor.server.method_handlers['sims.insert'].apply({ userId });
      expect(Sims.findOne({ _id, userId })).to.exist;
    });

    // eslint-disable-next-line no-undef, func-names, prefer-arrow-callback
    it('should not insert a sim if not authenticated', function () {
      expect(() => {
        Meteor.server.method_handlers['sims.insert']();
      }).to.throw();
    });
  });
}
