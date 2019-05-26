/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { validateNewUser } from './users';

if (Meteor.isServer) {
  // eslint-disable-next-line no-undef, func-names, prefer-arrow-callback
  describe('users', function () {
    // eslint-disable-next-line no-undef, func-names, prefer-arrow-callback
    it('should allow valid email address', function () {
      const testUser = {
        emails: [
          {
            address: 'test@example.com',
          },
        ],
      };
      const res = validateNewUser(testUser);
      expect(res).to.be.true;
    });

    // eslint-disable-next-line no-undef, func-names, prefer-arrow-callback
    it('should reject invalid address', function () {
      const testUser = {
        emails: [
          {
            address: 'example',
          },
        ],
      };

      expect(() => {
        validateNewUser(testUser);
      }).to.throw();
    });
  });
}
