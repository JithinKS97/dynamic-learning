/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { mount, configure } from 'enzyme';
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

require('chai');

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import { CreateLessonPlan } from './CreateLessonPlan';
  import { Oscillations, Oscillations1 } from './CreateLessonPlanTestData.js';

  configure({ adapter: new Adapter() });

  describe('CreateLessonPlan', () => {
    describe('Loading of CreateLessonplan', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should load successfully', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        wrapper.find(CreateLessonPlan).setState({ ...Oscillations });

        wrapper.unmount();
      });
    });

    describe('Addition and deletion of slide', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('(no of slides = 2, curSlide = 1), after insertion of slide, slides length = 3, curSlide = 2', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({
          curSlide: 1,
          slides: [{ notes: '0', iframes: [], textboxes: [] }, { notes: '1', iframes: [], textBoxes: [] }],
        });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        instance.addNewSlide();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        expect(CreateLessonPlanWrapper.state().slides.length).to.equal(3);
        expect(CreateLessonPlanWrapper.state().curSlide).to.equal(2);

        wrapper.unmount();
      });

      it('(no of slides = 2, curSlide = 1), after deletion, curSlide should be 0 and content of slide 0 should be displayed', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({ curSlide: 1, ...Oscillations });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        const slideToShowAfterDeletion = instance.state.slides[0];

        instance.deleteSlide(1);

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        expect(CreateLessonPlanWrapper.state().curSlide).to.equal(0);
        expect(
          CreateLessonPlanWrapper.state().slides[CreateLessonPlanWrapper.state().curSlide],
        ).to.deep.include(slideToShowAfterDeletion);

        wrapper.unmount();
      });

      it('(no of slides = 1, curSlide = 0), after deletion, curSlide should be 0 and slides should reset', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({
          curSlide: 0,
          slides: [{ notes: '', iframes: [], textboxes: [] }],
        });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        instance.deleteSlide(0);

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        expect(CreateLessonPlanWrapper.state().curSlide).to.equal(0);
        expect(CreateLessonPlanWrapper.state().slides[0].notes).to.not.equal('');

        wrapper.unmount();
      });

      it('(no of slides = 3, curSlide = 1, deletedSlide = 1), after deletion curSlide should be 1 and contents of next slide should be displayed', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({ curSlide: 1, ...Oscillations1 });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        const slideToShowAfterDeletion = instance.state.slides[2];

        instance.deleteSlide(1);

        // console.log(CreateLessonPlanWrapper.state().slides)

        expect(instance.state.slides[instance.state.curSlide])
          .to
          .deep
          .include(slideToShowAfterDeletion);

        wrapper.unmount();
      });
    });

    describe('Navigation between slides', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('(no of slides = 2, curSlide = 1), after navigation to slide 0, contents of slide 0 should be displayed', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({ curSlide: 1, ...Oscillations });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        instance.saveChanges(undefined, 0);

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        expect(CreateLessonPlanWrapper.state().curSlide).to.equal(0);
        expect(
          CreateLessonPlanWrapper.state().slides[CreateLessonPlanWrapper.state().curSlide],
        ).to.deep.include(CreateLessonPlanWrapper.state().slides[0]);

        wrapper.unmount();
      });
    });

    describe('Textbox', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should insert a textbox', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        instance.addTextBox();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        // console.log(CreateLessonPlanWrapper.state().slides[0])

        expect(CreateLessonPlanWrapper.state().slides[0].textboxes[0].value).to.equal('new text box');

        wrapper.unmount();
      });

      it('should delete a textbox', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [{ value: 'sample value' }] }],
        });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        instance.deleteTextBox(0);

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        // console.log(CreateLessonPlanWrapper.state().slides[0])

        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0);

        wrapper.unmount();
      });
    });

    describe('Undo and redo', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('checks the working of undo', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        instance.addTextBox();
        instance.addTextBox();
        instance.addTextBox();

        instance.undo();
        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(2);

        instance.undo();
        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(1);

        instance.undo();
        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0);

        instance.undo();
        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0);

        instance.addTextBox();
        instance.deleteTextBox(0);

        instance.undo();
        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(1);

        wrapper.unmount();
      });

      it('checks the working of redo', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        const instance = CreateLessonPlanWrapper.instance();

        // console.log(CreateLessonPlanWrapper.state().slides)
        // console.log(CreateLessonPlanWrapper.state().curSlide)

        instance.addTextBox();

        instance.undo();

        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0);

        instance.redo();

        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(1);

        instance.deleteTextBox(0);

        instance.undo();
        instance.redo();

        expect(CreateLessonPlanWrapper.state().slides[0].textboxes.length).to.equal(0);

        wrapper.unmount();
      });
    });

    describe('Changing size of the canvas', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('checks the working of increase canvas size', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({ ...Oscillations });

        const instance = CreateLessonPlanWrapper.instance();

        instance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        instance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1500px');

        expect(CreateLessonPlanWrapper.state().slides[0].note)
          .to
          .equal(Oscillations.slides[0].note);

        wrapper.unmount();
      });

      it('checks the working of decrease canvas size', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({ ...Oscillations });

        const instance = CreateLessonPlanWrapper.instance();

        instance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        instance.changePageCount(-1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('900px');

        wrapper.unmount();
      });

      it('should not reduce the size of the canvas if a textbox/sim overflows after the reduction ( checkCanvasSize returns 1)', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);
        const CreateLessonPlanInstance = CreateLessonPlanWrapper.instance();
        CreateLessonPlanWrapper.setState({ ...Oscillations });
        CreateLessonPlanInstance.changePageCount(1); // canvas size set to 1200px
        CreateLessonPlanWrapper.setState({
          slides: [{
            note: [],
            iframes: [],
            pageCount: 1,
            textboxes: [
              {
                value: 'new text box',
                x: 50,
                y: 900, // the y value is 900 px, so after reduction
              }, // canvas size becomes 900 which is < bottom most point ( 900 + height of textbox)
            ], // So reduction should not be allowed
          },
          ],
        });
        expect(CreateLessonPlanInstance.checkCanvasSize()).to.equal(1);
        wrapper.unmount();
      });
    });

    describe('Addition and deletion of sim', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should add a sim to the current slide', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonPlanWrapper = wrapper.find(CreateLessonPlan);

        CreateLessonPlanWrapper.setState({ ...Oscillations });

        CreateLessonPlanWrapper.setState({ curSlide: 1 });

        const AddSimWrapper = wrapper.find('AddSim');

        const AddSimInstance = AddSimWrapper.instance();

        AddSimWrapper.setState({
          node: {
            username: 'jithunni.ks',
            project_id: 'bHKMbX-hN',
            w: '640px',
            h: '360px',
          },
        });

        AddSimInstance.addToLesson();

        expect(CreateLessonPlanWrapper.state().slides[1].iframes.length).to.equal(1);

        wrapper.unmount();
      });

      it('should delete sim', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const componentWrapper = wrapper.find(CreateLessonPlan);

        componentWrapper.setState({ ...Oscillations });

        const componentInstance = componentWrapper.instance();

        componentInstance.deleteSim(0);

        expect(componentWrapper.state().slides[0].iframes.length).to.equal(0);

        wrapper.unmount();
      });
    });

    describe('Interact and draw mode toggle', () => {
      let div;

      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should correctly enable and disable pointer events in canvas', () => {
        const wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan />} />
          </Router>,
          { attachTo: window.domNode },
        );

        const CreateLessonplanInstance = wrapper.find(CreateLessonPlan).instance();

        expect(getComputedStyle(wrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('auto');
        expect(CreateLessonplanInstance.state.interactEnabled).to.equal(false);

        CreateLessonplanInstance.interact();

        expect(getComputedStyle(wrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('none');
        expect(CreateLessonplanInstance.state.interactEnabled).to.equal(true);

        wrapper.unmount();
      });
    });
  });
}

/*
    Unit tests needed

    How do we test

    1) Navigation between the slides, going to the next and previous slide - check
    2) Moving to any slide by pressing it - check
    3) Deletion of a slide - check
    4) Addition of new slide - check
    5) Interact and draw - check
    6) Addition of simulations - check
    7) Undo and redo - check
    8) Increasing and decreasing - check
    9) According the position of simulation, allow or disallow changing of size of canvas - check
*/
