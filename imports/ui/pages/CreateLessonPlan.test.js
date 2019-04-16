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

    describe('LessonplanCreator loading', function() {

        let div
        
        before(() => {
            div = document.createElement('div');
            window.domNode = div;
            document.body.appendChild(div);
        })
        
        it('should load successfully', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )
                        
            wrapper.find(CreateLessonPlan).setState({slides:[{notes:'', iframes:[], textBoxes:[]}]})
            wrapper.unmount()

        })

        

    })

    describe('Deletion of slide', function() {

        let div
        
        before(() => {
            div = document.createElement('div');
            window.domNode = div;
            document.body.appendChild(div);
        })
        
        it('(no of slides = 2, curSlide = 1), after deletion curSlide should be 0 and content of slide 0 should be displayed', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({curSlide:1, slides:[{notes:'0', iframes:[], textBoxes:[]}, {notes:'1', iframes:[], textBoxes:[]}]})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.deleteSlide(1)

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            expect(CreateLessonPlanWrapper.state().curSlide).to.equal(0)
            expect(CreateLessonPlanWrapper.state().slides[0].notes).to.equal('0')

            wrapper.unmount()
           
        })

        it('(no of slides = 1, curSlide = 0), after deletion curSlide should be 0 and slides should reset', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({curSlide:0, slides:[{notes:'', iframes:[], textBoxes:[]}]})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.deleteSlide(0)

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            expect(CreateLessonPlanWrapper.state().curSlide).to.equal(0)
            expect(CreateLessonPlanWrapper.state().slides[0].notes).to.not.equal('')

            wrapper.unmount()
           
        })

        it('(no of slides = 3, curSlide = 1, deletedSlide = 1), after deletion curSlide should be 1 and contents of next slide should be displayed', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({curSlide:1, slides:[{notes:'0', iframes:[], textBoxes:[]}, {notes:'1', iframes:[], textBoxes:[]}, {notes:'2', iframes:[], textBoxes:[]}]})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.deleteSlide(1)

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            expect(CreateLessonPlanWrapper.state().slides[1].notes).to.equal('2')

            wrapper.unmount()
           
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