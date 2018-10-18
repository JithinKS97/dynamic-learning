import { Meteor } from 'meteor/meteor'
import React from'react'
import { mount } from 'enzyme'
const chai = require('chai')
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history';

if(Meteor.isClient) {

import CreateLessonPlan from './CreateLessonPlan'
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

    describe('CreateLessonPlan', function() {
        
        it('should pass', function() {

            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/" component={CreateLessonPlan}/>
                 </Router>
            )
        })

        it('should call the function', function() {

            console.log(chai)
        })

    })

}

/*
    Unit tests needed

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