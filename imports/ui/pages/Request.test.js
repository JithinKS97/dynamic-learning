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
  });
}
