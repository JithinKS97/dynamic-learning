/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { mount, configure } from 'enzyme';
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import Profile from './Profile';

  configure({ adapter: new Adapter() });

  describe('Loading profile page', () => {
    let div;

    before(() => {
      div = document.createElement('div');
      window.domNode = div;
      document.body.appendChild(div);
    });

    it('Should load profile properly', () => {
      const wrapper = mount(
        <Router history={createMemoryHistory()}>
          <Route path="/" render={() => <Profile />} />
        </Router>,
        { attachTo: window.domNode },
      );

      wrapper.unmount();
    });
  });

  describe('Testing functions relating to information on profile', () => {
    let div;

    before(() => {
      div = document.createElement('div');
      window.domNode = div;
      document.body.appendChild(div);
    });

    it('should update school properly', () => {
      const wrapper = mount(
        <Router history={createMemoryHistory()}>
          <Route path="/" render={() => <Profile />} />
        </Router>,
        { attachTo: window.domNode },
      );

      const ProfileWrapper = wrapper.find(Profile);
      ProfileWrapper.setState({ user: 'ad665' });

      const instance = ProfileWrapper.instance();
      instance.school.value = 'Cornell University';

      instance.updateSchool();
      expect(ProfileWrapper.state().school).to.equal('Cornell University');

      wrapper.unmount();
    });
  });
}
