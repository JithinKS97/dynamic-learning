/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { mount, configure } from 'enzyme';
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

/**
 * Test cases to write -
 *
 * Editing of title and description - check
 * Addition and deletion of slide (authenticated and not authenticated) - check
 * Editing the title and description of slide - check
 * Adding and deleting comments - check
 * Replying to comments
 * Adding simulation
 * Editing the simulation
 * Rendering comment form only if user is a member
 * Showing edit only for owners - slides, comment, simulation
 */

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import { Request } from './Request';

  configure({ adapter: new Adapter() });

  describe('Request', () => {
    let div;
    let RequestWrapper;
    let wrapper;

    before(() => {
      div = document.createElement('div');
      window.domNode = div;
      document.body.appendChild(div);
    });

    describe('Mounting of Request page', () => {
      it('should mount successfully', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request isAuthenticated isOwner />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();
      });
      it('should set the title and description of the Requests forum', () => {
        RequestInstance.setState({ editTitle: 'test-title', editDescription: 'test-description' });
        RequestInstance.setTitleAndDescription();
        RequestInstance.isMember = true;
        expect(RequestInstance.state.requestTitle).to.equal('test-title');
        expect(RequestInstance.state.description).to.equal('test-description');
        expect(wrapper.find('.requestTitle').text()).to.equal('test-title');
        expect(wrapper.find('.requestDescription').text()).to.equal('test-description');
        wrapper.unmount();
      });
      it('should edit the title and description if authenticated and is owner', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request isAuthenticated isOwner />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();

        RequestWrapper.setState({
          editDescription: 'sample-description',
          editTitle: 'sample-title',
        });

        RequestInstance.setTitleAndDescription();

        expect(RequestInstance.state.requestTitle).to.equal('sample-title');
        expect(RequestInstance.state.description).to.equal('sample-description');
        wrapper.unmount();
      });
    });
    describe('Addition and deletion of slide', () => {
      it('should add a slide if authenticated and isOwner', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request isAuthenticated isOwner />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();

        RequestWrapper.setState({
          slides: [{
            title: '', userId: '', time: '', comments: [], iframes: [],
          }],
        });
        RequestInstance = RequestWrapper.instance();
        RequestInstance.push('slide-1');
        expect(RequestInstance.state.slides.length).to.equal(1);
        expect(RequestInstance.state.slides[0].title).to.equal('slide-1');
        RequestInstance.push('slide-2');
        expect(RequestInstance.state.slides.length).to.equal(2);
        expect(RequestInstance.state.slides[1].title).to.equal('slide-2');
        wrapper.unmount();
      });
      it('should not add a slide if not authenticated', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();

        RequestWrapper.setState({
          slides: [{
            title: '', userId: '', time: '', comments: [], iframes: [],
          }],
        });
        RequestInstance = RequestWrapper.instance();
        RequestInstance.push('slide-1');
        expect(RequestInstance.state.slides.length).to.equal(1);
        expect(RequestInstance.state.slides[0].title).to.not.equal('slide-1');
        RequestInstance.push('slide-2');
        expect(RequestInstance.state.slides.length).to.equal(1);
        wrapper.unmount();
      });
      it('should not delete a slide if user is not authenticated', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request isOwner />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();

        RequestWrapper.setState({
          slides: [{
            title: 'slide-1', userId: '', time: '', comments: [], iframes: [],
          }],
        });

        RequestInstance.deleteSlide(0);
        expect(RequestInstance.state.slides[0].title).to.equal('slide-1');
        wrapper.unmount();
      });
      it('should delete a slide only if user is authenticated and owner', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request isAuthenticated isOwner />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();

        RequestWrapper.setState({
          slides: [{
            title: '', userId: '', time: '', comments: [], iframes: [],
          }],
        });

        RequestInstance.push('slide-1');
        RequestInstance.deleteSlide(0);
        expect(RequestInstance.state.slides[0].title).to.equal('');
        wrapper.unmount();
      });
      it('should not delete a slide if a user is authenticated and not owner', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request isAuthenticated />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();

        RequestWrapper.setState({
          slides: [{
            title: 'slide-1', userId: '', time: '', comments: [], iframes: [],
          }],
        });

        RequestInstance.deleteSlide(0);
        expect(RequestInstance.state.slides[0].title).to.equal('slide-1');
        wrapper.unmount();
      });
    });

    describe('Comments', () => {
      it('should add and delete comment if authenticated and is member (delete only if user owns the comment)', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route
              path="/"
              render={() => (
                <Request
                  isAuthenticated
                  isOwner
                  requestExists
                  currentUserId="userId-1"
                  isMember
                  request={{
                    slides: [{
                      title: 'slide-1',
                      userId: 'userId-1',
                      time: '',
                      comments: [],
                      iframes: [],
                    }],
                    _idToNameMappings: { 'userId-1': 'user-1' },
                    show: true,
                    requestTitle: 'title',
                    description: 'description',
                  }}
                />
              )}
            />
          </Router>,
          { attachTo: window.domNode },
        );
        wrapper.setProps();
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();
        RequestInstance.setState();
        const CommentFormInstance = wrapper.find('CommentForm').instance();
        CommentFormInstance.comment.value = 'test-comment';
        CommentFormInstance.postComment();
        expect(RequestInstance.state.slides[0].comments[0].comment).to.equal('test-comment');
        expect(RequestInstance.state.slides[0].comments[0].userId).to.equal('userId-1');
        RequestInstance.deleteComment(0);
        expect(RequestInstance.state.slides[0].comments.length).to.equal(0);
        wrapper.unmount();
      });
    });
  });
}
