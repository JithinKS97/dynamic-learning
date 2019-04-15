import { Meteor } from 'meteor/meteor'
import React from'react'
import { mount } from 'enzyme'
const chai = require('chai')
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history';
import { debug } from 'util';

if(Meteor.isClient) {

import { CreateLessonPlan } from './CreateLessonPlan'
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

    describe('CreateLessonPlan', function() {
        
        it('should pass', function() {

            const div = global.document.createElement('div');
            global.document.body.appendChild(div);

            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>
                 
            )

            console.log(wrapper.exists('.lessonplan'))
        })

    })

}

/*
    Unit tests needed

    How do we test

    1) Navigation between the slides, going to the next and previous slide
    2) Moving to any slide by pressing it
    3) Deletion of a slide
    4) Addition of new slide
    5) Interact and draw
    6) Addition of simulations
    7) Undo and redo
    8) Increasing and decreasing
    9) According the position of simulation, allow or disallow changing of size of canvas
*/