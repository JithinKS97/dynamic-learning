/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { mount, configure } from 'enzyme';
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

/*
    Unit tests covered

    1) Mounting of Component
    2) Addition and deletion ( different cases ) - check
    3) Navigation between slides
    4) Addition / deletion of textboxes
    4) Interact and draw - check
    5) Undo and redo - check
    6) Changing size fo canvas (conditional also) - check
    5) Addition / deletion of simulations - check
    8) Interact and draw mode - check
*/

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import { CreateLessonPlan } from './CreateLessonPlan';
  import { Oscillations, Oscillations1 } from './CreateLessonPlanTestData.js';

  configure({ adapter: new Adapter() });

  describe('CreateLessonPlan', () => {
    let div;
    let wrapper;
    let CreateLessonplanWrapper;
    let CreateLessonplanInstance;

    describe('Mounting of CreateLessonplan', () => {
      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should mount successfully', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateLessonPlan lessonplanExists />} />
          </Router>,
          { attachTo: window.domNode },
        );
        CreateLessonplanWrapper = wrapper.find(CreateLessonPlan);
        CreateLessonplanInstance = CreateLessonplanWrapper.instance();
        CreateLessonplanWrapper.setState({ ...Oscillations });
        CreateLessonplanWrapper.setState({ initialized: true });
      });
    });

    describe('Addition and deletion of slide', () => {
      it('(no of slides = 2, curSlide = 1), after insertion of slide, slides length = 3, curSlide = 2', () => {
        CreateLessonplanWrapper.setState({
          curSlide: 1,
          slides: [{ notes: '0', iframes: [], textboxes: [] }, { notes: '1', iframes: [], textBoxes: [] }],
        });

        CreateLessonplanInstance.addNewSlide();

        expect(CreateLessonplanWrapper.state().slides.length).to.equal(3);
        expect(CreateLessonplanWrapper.state().curSlide).to.equal(2);
      });

      it('(no of slides = 2, curSlide = 1), after deletion, curSlide should be 0 and content of slide 0 should be displayed', () => {
        CreateLessonplanWrapper.setState({ curSlide: 1, ...Oscillations });

        const slideToShowAfterDeletion = CreateLessonplanWrapper.state().slides[0];

        CreateLessonplanInstance.deleteSlide(1);
        expect(CreateLessonplanWrapper.state().curSlide).to.equal(0);
        expect(
          CreateLessonplanWrapper.state().slides[CreateLessonplanWrapper.state().curSlide],
        ).to.deep.include(slideToShowAfterDeletion);
      });

      it('(no of slides = 1, curSlide = 0), after deletion, curSlide should be 0 and slides should reset', () => {
        CreateLessonplanWrapper.setState({
          curSlide: 0,
          slides: [{ notes: '', iframes: [], textboxes: [] }],
        });

        CreateLessonplanInstance.deleteSlide(0);

        expect(CreateLessonplanWrapper.state().curSlide).to.equal(0);
        expect(CreateLessonplanWrapper.state().slides[0].notes).to.not.equal('');
      });

      it('(no of slides = 3, curSlide = 1, deletedSlide = 1), after deletion curSlide should be 1 and contents of next slide should be displayed', () => {
        CreateLessonplanWrapper.setState({ curSlide: 1, ...Oscillations1 });

        const slideToShowAfterDeletion = CreateLessonplanInstance.state.slides[2];

        CreateLessonplanInstance.deleteSlide(1);

        expect(CreateLessonplanInstance.state.slides[CreateLessonplanInstance.state.curSlide])
          .to
          .deep
          .include(slideToShowAfterDeletion);
      });
    });

    describe('Navigation between slides', () => {
      it('(no of slides = 2, curSlide = 1), after navigation to slide 0, contents of slide 0 should be displayed', () => {
        CreateLessonplanWrapper.setState({ curSlide: 1, ...Oscillations });

        CreateLessonplanInstance.saveChanges(undefined, 0);

        expect(CreateLessonplanWrapper.state().curSlide).to.equal(0);
        expect(
          CreateLessonplanWrapper.state().slides[CreateLessonplanWrapper.state().curSlide],
        ).to.deep.include(CreateLessonplanWrapper.state().slides[0]);
      });
    });

    describe('Textbox', () => {
      it('should insert a textbox', () => {
        CreateLessonplanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });
        CreateLessonplanInstance.addTextBox();
        expect(CreateLessonplanWrapper.state().slides[0].textboxes[0].value).to.equal('new text box');
      });

      it('should delete a textbox', () => {
        CreateLessonplanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [{ value: 'sample value' }] }],
        });
        CreateLessonplanInstance.deleteTextBox(0);
        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Undo and redo', () => {
      it('checks the working of undo', () => {
        CreateLessonplanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        // Clear undo stacks to remove the items during the last test
        CreateLessonplanInstance.undoStacks = [];

        CreateLessonplanInstance.addTextBox();
        CreateLessonplanInstance.addTextBox();
        CreateLessonplanInstance.addTextBox();

        CreateLessonplanInstance.undo();
        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(2);

        CreateLessonplanInstance.undo();
        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(1);

        CreateLessonplanInstance.undo();
        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(0);

        CreateLessonplanInstance.undo();
        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(0);

        CreateLessonplanInstance.addTextBox();
        CreateLessonplanInstance.deleteTextBox(0);

        CreateLessonplanInstance.undo();
        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(1);
      });

      it('checks the working of redo', () => {
        CreateLessonplanWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        CreateLessonplanInstance.addTextBox();

        CreateLessonplanInstance.undo();

        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(0);

        CreateLessonplanInstance.redo();

        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(1);

        CreateLessonplanInstance.deleteTextBox(0);

        CreateLessonplanInstance.undo();
        CreateLessonplanInstance.redo();

        expect(CreateLessonplanWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Changing size of the canvas', () => {
      it('checks the working of increase canvas size', () => {
        CreateLessonplanWrapper.setState({ ...Oscillations });

        CreateLessonplanInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        CreateLessonplanInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1500px');

        expect(CreateLessonplanWrapper.state().slides[0].note)
          .to
          .equal(Oscillations.slides[0].note);

        // Revert the changes
        CreateLessonplanInstance.changePageCount(-1);
        CreateLessonplanInstance.changePageCount(-1);
      });

      it('checks the working of decrease canvas size', () => {
        CreateLessonplanWrapper.setState({ ...Oscillations });

        CreateLessonplanInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        CreateLessonplanInstance.changePageCount(-1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('900px');
      });

      it('should not reduce the size of the canvas if a textbox/sim overflows after the reduction ( checkCanvasSize returns 1)', () => {
        CreateLessonplanWrapper.setState({ ...Oscillations });
        CreateLessonplanInstance.changePageCount(1); // canvas size set to 1200px
        CreateLessonplanWrapper.setState({
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
        expect(CreateLessonplanInstance.checkCanvasSize()).to.equal(1);
      });
    });

    describe('Addition and deletion of sim', () => {
      it('should add a sim to the current slide', () => {
        CreateLessonplanWrapper.setState({ ...Oscillations });

        CreateLessonplanWrapper.setState({ curSlide: 1 });

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

        expect(CreateLessonplanWrapper.state().slides[1].iframes.length).to.equal(1);
      });

      it('should delete sim', () => {
        CreateLessonplanWrapper.setState({ ...Oscillations });

        CreateLessonplanWrapper.setState({ curSlide: 0 });

        CreateLessonplanInstance.deleteSim(0);

        expect(CreateLessonplanWrapper.state().slides[0].iframes.length).to.equal(0);
      });
    });

    describe('Interact and draw mode toggle', () => {
      it('should correctly enable and disable pointer events in canvas', () => {
        expect(getComputedStyle(CreateLessonplanWrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('auto');
        expect(CreateLessonplanInstance.state.interactEnabled).to.equal(false);

        CreateLessonplanInstance.interact();

        expect(getComputedStyle(wrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('none');
        expect(CreateLessonplanInstance.state.interactEnabled).to.equal(true);

        wrapper.unmount();
      });
    });
  });
}
