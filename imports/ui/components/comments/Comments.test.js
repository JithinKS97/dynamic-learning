/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import { mount, configure } from 'enzyme';
import React from 'react';

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import CommentBox from './CommentBox';

  configure({ adapter: new Adapter() });

  describe('Comments', () => {
    let div;
    // let wrapper;
    // let CommentBoxWrapper;
    // let CommentBoxInstance;
    before(() => {
      div = document.createElement('div');
      window.domNode = div;
      document.body.appendChild(div);
    });
    describe('Loading a CommentsBox', () => {
      it('Should load CommentBox properly', () => {
        wrapper = mount(
          <CommentBox
            isMember
            comment={{ comment: 'test-comment' }}
            index={-1}
            editComment={() => {}}
            deleteComment={() => {}}
            replies={[{ comment: 'reply-comment', userId: 'userId-2' }]}
            deleteReplyComment={() => {}}
            editReplyComment={() => {}}
            slides={[]}
            curSlide={0}
            updateSlides={() => {}}
            isAuthenticated
            username="user-1"
            _idToNameMappings={{ 'userId-2': 'user-2' }}
            currentUserId=""
          />,
          { attachTo: window.domNode },
        );
        wrapper.unmount();
      });
    });
  });
}
