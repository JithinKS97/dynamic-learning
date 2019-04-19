import { Meteor } from 'meteor/meteor'
import React from'react'
import { mount } from 'enzyme'
require('chai')
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history';

if(Meteor.isClient) {

import { CreateLessonPlan } from './CreateLessonPlan'
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { Oscillations, Oscillations1 } from './CreateLessonPlanTestData.js'

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
                        
            wrapper.find(CreateLessonPlan).setState({...Oscillations})

            wrapper.unmount()

        })    

    })

    describe('Addition and deletion of slide', function() {

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

            CreateLessonPlanWrapper.setState({curSlide:1, ...Oscillations})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            const slideToShowAfterDeletion = instance.state.slides[0]

            instance.deleteSlide(1)
            

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            expect(CreateLessonPlanWrapper.state().curSlide).to.equal(0)
            expect(CreateLessonPlanWrapper.state().slides[CreateLessonPlanWrapper.state().curSlide]).to.deep.include(slideToShowAfterDeletion)

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

            CreateLessonPlanWrapper.setState({curSlide:0, slides:[{notes:'', iframes:[], textboxes:[]}]})

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

            CreateLessonPlanWrapper.setState({curSlide:1, ...Oscillations1})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            const slideToShowAfterDeletion = instance.state.slides[2]

            instance.deleteSlide(1)

            // console.log(CreateLessonPlanWrapper.state().slides)

            expect(instance.state.slides[instance.state.curSlide]).to.deep.include(slideToShowAfterDeletion)

            wrapper.unmount()
           
        })

        it('(no of slides = 2, curSlide = 1), after insertion of slide, slides length = 3', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({curSlide:1, slides:[{notes:'0', iframes:[], textboxes:[]}, {notes:'1', iframes:[], textBoxes:[]}]})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.addNewSlide()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            expect(CreateLessonPlanWrapper.state().slides.length).to.equal(3)

            wrapper.unmount()
           
        })

    })

    describe('Navigation between slides', function() {

        let div
        
        before(() => {
            div = document.createElement('div');
            window.domNode = div;
            document.body.appendChild(div);
        })
        
        it('(no of slides = 2, curSlide = 1), after navigation to slide 0, contents of slide 0 should be displayed', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({curSlide:1, ...Oscillations})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.saveChanges(undefined, 0)

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            expect(CreateLessonPlanWrapper.state().curSlide).to.equal(0)
            expect(CreateLessonPlanWrapper.state().slides[CreateLessonPlanWrapper.state().curSlide]).to.deep.include(CreateLessonPlanWrapper.state().slides[0])

            wrapper.unmount()
           
        })

    })

    describe('Textbox', function() {

        let div
        
        before(() => {
            div = document.createElement('div');
            window.domNode = div;
            document.body.appendChild(div);
        })
        
        it('should insert a textbox', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({slides:[{notes:'0', iframes:[], textboxes:[]}]})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.addTextBox()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            //console.log(CreateLessonPlanWrapper.state().slides[0])

            expect(CreateLessonPlanWrapper.state().slides[0].textboxes[0].value).to.equal('new text box')

            wrapper.unmount()
           
        })

        it('should delete a textbox', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({slides:[{notes:'0', iframes:[], textboxes:[{value:'sample value'}]}]})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.deleteTextBox(0)

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            //console.log(CreateLessonPlanWrapper.state().slides[0])

            expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0)

            wrapper.unmount()
           
        })

    })

    describe('Undo', function() {

        let div
        
        before(() => {
            div = document.createElement('div');
            window.domNode = div;
            document.body.appendChild(div);
        })
        
        it('checks the working of undo', function() {


            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/"  render={() => (
                        <CreateLessonPlan/>
                    )}/>
                 </Router>,

                 { attachTo: window.domNode }
                 
            )

            const CreateLessonPlanWrapper =  wrapper.find(CreateLessonPlan)

            CreateLessonPlanWrapper.setState({slides:[{notes:'0', iframes:[], textboxes:[]}]})

            const instance = CreateLessonPlanWrapper.instance()

            // console.log(CreateLessonPlanWrapper.state().slides)
            // console.log(CreateLessonPlanWrapper.state().curSlide)

            instance.addTextBox()
            instance.addTextBox()
            instance.addTextBox()

            instance.undo()
            expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(2)

            instance.undo()
            expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(1)

            instance.undo()
            expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0)

            instance.undo()
            expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0)

            

            instance.addTextBox()
            instance.deleteTextBox(0)

            instance.undo()
            expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(1)

            console.log(instance.state.scaleX)

            wrapper.unmount()
           
        })

        
    })

}

/*
    Unit tests needed

    How do we test

    1) Navigation between the slides, going to the next and previous slide - check
    2) Moving to any slide by pressing it - check
    3) Deletion of a slide - check
    4) Addition of new slide - check
    5) Interact and draw
    6) Addition of simulations
    7) Undo and redo
    8) Increasing and decreasing
    9) According the position of simulation, allow or disallow changing of size of canvas
*/