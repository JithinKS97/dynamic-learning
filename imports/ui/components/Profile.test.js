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

  describe('Profiles', () => {
    let div;
    let wrapper;
    let ProfileWrapper;
    let ProfileInstance;

    before(() => {
      div = document.createElement('div');
      window.domNode = div;
      document.body.appendChild(div);
    });
    describe('Loading profile page', () => {
      it('Should load profile properly', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Profile />} />
          </Router>,
          { attachTo: window.domNode },
        );
        ProfileWrapper = wrapper.find(Profile);
        ProfileInstance = ProfileWrapper.instance();
      });
    });

    describe('Testing functions relating to information on profile', () => {
      it('should update school properly', () => {
        ProfileWrapper.setState({ user: 'ad665', type: 'Student' });
        ProfileInstance.school.value = 'Cornell University';

        ProfileInstance.updateSchool();
        expect(ProfileWrapper.state().school).to.equal('Cornell University');

        wrapper.unmount();
      });
    });
  });
}
