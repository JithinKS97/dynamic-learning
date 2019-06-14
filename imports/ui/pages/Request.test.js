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
 * Editing of title and description
 * Addition and deletion of slide (authenticated and not authenticated)
 * Editing the title of slide
 * Adding and deleting comments
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
            <Route path="/" render={() => <Request />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();
      });
      it('should set the title and description of the Requests forum', () => {
        RequestInstance.setState({ editTitle: 'test-title', editDescription: 'test-description' });
        RequestInstance.setTitle();
        RequestInstance.isMember = true;
        expect(RequestInstance.state.requestTitle).to.equal('test-title');
        expect(RequestInstance.state.description).to.equal('test-description');
        expect(wrapper.find('.requestTitle').text()).to.equal('test-title');
        expect(wrapper.find('.requestDescription').text()).to.equal('test-description');
        wrapper.unmount();
      });
    });
    describe('Addition and deletion of slide', () => {
      it('should add a slide if authenticated', () => {
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
    });
  });
}
