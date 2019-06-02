import { Meteor } from 'meteor/meteor'
import React from 'react'
import { mount } from 'enzyme'
require('chai')
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history';

if (Meteor.isClient) {

    import { Profile } from './Profile'
    import { configure } from 'enzyme';
    import Adapter from 'enzyme-adapter-react-16';

}

configure({ adapter: new Adapter() });

describe('Loading profile page', function () {

    let div;

    before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
    })

    it('Should load profile properly', function () {
        const wrapper = mount(

            <Router history={createMemoryHistory()}>
                <Route path="/" render={() => (
                    <Profile />
                )} />
            </Router>,

            { attachTo: window.domNode }
        );

        wrapper.unmount(); 
    }); 
}); 

describe('Testing functions relating to information on profile', function() {

    let div;

    before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
    })

    it('should update school properly', function() {
        const wrapper = mount (

            <Router history={createMemoryHistory()}>
                <Route path="/"  render={() => (
                    <Profile/>
                )}/>
             </Router>,

             { attachTo: window.domNode }
             
        )

        wrapper.find(Profile).setState({user: 'ad665'}); 
            
        const instance = Profile.instance(); 
        instance.school = {value: 'Cornell University'}; 

        instance.updateSchool(); 
        expect(Profile.state().school).to.equal('Cornell University'); 

    }); 

}); 