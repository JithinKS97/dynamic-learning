/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { mount, configure } from 'enzyme';
// import { expect } from 'chai';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import { Request } from './Request';

  configure({ adapter: new Adapter() });

  describe('Request', () => {
    describe('Loading of Request page', () => {
      let div;
      let RequestWrapper;
      let wrapper;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <Request />} />
          </Router>,
          { attachTo: window.domNode },
        );
        RequestWrapper = wrapper.find(Request);
        RequestInstance = RequestWrapper.instance();
      });

      it('should load successfully', () => {
        wrapper.unmount();
      });
    });
  });
}
