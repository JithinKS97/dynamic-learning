/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { mount, configure } from 'enzyme';
import { expect } from 'chai';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

/**
 * Mounting of component
 * Navigation between slides
 * Addition and deletion (different cases) of slides
 * Addition/ deletion of textboxes, sims and assessments
 * Interact and draw
 * Undo and redo
 * Chanding the size of the canvas (Conditional also)
 * Addition / deletion of simulations
 */

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import { WorkbookEditor } from './WorkbookEditor';
  import { Oscillations, Oscillations1 } from './WorkbookEditorTestData.js';

  configure({ adapter: new Adapter() });

  describe('WorkbookEditor', () => {
    let div;
    let wrapper;
    let WorkbookEditorWrapper;
    let WorkbookEditorInstance;

    describe('Mounting of WorkbookEditor', () => {
      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should mount successfully', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <WorkbookEditor workbookExists />} />
          </Router>,
          { attachTo: window.domNode },
        );
        WorkbookEditorWrapper = wrapper.find(WorkbookEditor);
        WorkbookEditorInstance = WorkbookEditorWrapper.instance();
        WorkbookEditorWrapper.setState({ ...Oscillations });
        WorkbookEditorWrapper.setState({ initialized: true });
      });
    });

    describe('Addition and deletion of slide', () => {
      it('(no of slides = 2, curSlide = 1), after insertion of slide, slides length = 3, curSlide = 2', () => {
        WorkbookEditorWrapper.setState({
          curSlide: 1,
          slides: [{ notes: '0', iframes: [], textboxes: [] }, { notes: '1', iframes: [], textBoxes: [] }],
        });

        WorkbookEditorInstance.addNewSlide();

        expect(WorkbookEditorWrapper.state().slides.length).to.equal(3);
        expect(WorkbookEditorWrapper.state().curSlide).to.equal(2);
      });

      it('(no of slides = 2, curSlide = 1), after deletion, curSlide should be 0 and content of slide 0 should be displayed', () => {
        WorkbookEditorWrapper.setState({ curSlide: 1, ...Oscillations });

        const slideToShowAfterDeletion = WorkbookEditorWrapper.state().slides[0];

        WorkbookEditorInstance.deleteSlide(1);
        expect(WorkbookEditorWrapper.state().curSlide).to.equal(0);
        expect(
          WorkbookEditorWrapper.state().slides[WorkbookEditorWrapper.state().curSlide],
        ).to.deep.include(slideToShowAfterDeletion);
      });

      it('(no of slides = 1, curSlide = 0), after deletion, curSlide should be 0 and slides should reset', () => {
        WorkbookEditorWrapper.setState({
          curSlide: 0,
          slides: [{ notes: '', iframes: [], textboxes: [] }],
        });

        WorkbookEditorInstance.deleteSlide(0);

        expect(WorkbookEditorWrapper.state().curSlide).to.equal(0);
        expect(WorkbookEditorWrapper.state().slides[0].notes).to.not.equal('');
      });

      it('(no of slides = 3, curSlide = 1, deletedSlide = 1), after deletion curSlide should be 1 and contents of next slide should be displayed', () => {
        WorkbookEditorWrapper.setState({ curSlide: 1, ...Oscillations1 });

        const slideToShowAfterDeletion = WorkbookEditorInstance.state.slides[2];

        WorkbookEditorInstance.deleteSlide(1);

        expect(WorkbookEditorInstance.state.slides[WorkbookEditorInstance.state.curSlide])
          .to
          .deep
          .include(slideToShowAfterDeletion);
      });
    });

    describe('Navigation between slides', () => {
      it('(no of slides = 2, curSlide = 1), after navigation to slide 0, contents of slide 0 should be displayed', () => {
        WorkbookEditorWrapper.setState({ curSlide: 1, ...Oscillations });

        WorkbookEditorInstance.changeSlide(0);

        expect(WorkbookEditorWrapper.state().curSlide).to.equal(0);
        expect(
          WorkbookEditorWrapper.state().slides[WorkbookEditorWrapper.state().curSlide],
        ).to.deep.include(WorkbookEditorWrapper.state().slides[0]);
      });
    });

    describe('Textbox', () => {
      it('should insert a textbox', () => {
        WorkbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });
        WorkbookEditorInstance.addTextBox();
        expect(WorkbookEditorWrapper.state().slides[0].textboxes[0].value).to.equal('new text box');
      });

      it('should delete a textbox', () => {
        WorkbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [{ value: 'sample value' }] }],
        });
        WorkbookEditorInstance.deleteTextBox(0);
        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Undo and redo', () => {
      it('checks the working of undo', () => {
        WorkbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        // Clear undo stacks to remove the items during the last test
        WorkbookEditorInstance.undoStacks = [];

        WorkbookEditorInstance.addTextBox();
        WorkbookEditorInstance.addTextBox();
        WorkbookEditorInstance.addTextBox();

        WorkbookEditorInstance.undo();
        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(2);

        WorkbookEditorInstance.undo();
        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(1);

        WorkbookEditorInstance.undo();
        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);

        WorkbookEditorInstance.undo();
        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);

        WorkbookEditorInstance.addTextBox();
        WorkbookEditorInstance.deleteTextBox(0);

        WorkbookEditorInstance.undo();
        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(1);
      });

      it('checks the working of redo', () => {
        WorkbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        WorkbookEditorInstance.addTextBox();

        WorkbookEditorInstance.undo();

        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);

        WorkbookEditorInstance.redo();

        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(1);

        WorkbookEditorInstance.deleteTextBox(0);

        WorkbookEditorInstance.undo();
        WorkbookEditorInstance.redo();

        expect(WorkbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Changing size of the canvas', () => {
      it('checks the working of increase canvas size', () => {
        WorkbookEditorWrapper.setState({ ...Oscillations });

        WorkbookEditorInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        WorkbookEditorInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1500px');

        expect(WorkbookEditorWrapper.state().slides[0].note)
          .to
          .equal(Oscillations.slides[0].note);

        // Revert the changes
        WorkbookEditorInstance.changePageCount(-1);
        WorkbookEditorInstance.changePageCount(-1);
      });

      it('checks the working of decrease canvas size', () => {
        WorkbookEditorWrapper.setState({ ...Oscillations });

        WorkbookEditorInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        WorkbookEditorInstance.changePageCount(-1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('900px');
      });

      it('should not reduce the size of the canvas if a textbox/sim overflows after the reduction ( checkCanvasSize returns 1)', () => {
        WorkbookEditorWrapper.setState({ ...Oscillations });
        WorkbookEditorInstance.changePageCount(1); // canvas size set to 1200px
        WorkbookEditorWrapper.setState({
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
        expect(WorkbookEditorInstance.checkCanvasSize()).to.equal(1);
      });
    });

    describe('Addition and deletion of sim', () => {
      it('should add a sim to the current slide', () => {
        WorkbookEditorWrapper.setState({ ...Oscillations });

        WorkbookEditorWrapper.setState({ curSlide: 1 });

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

        expect(WorkbookEditorWrapper.state().slides[1].iframes.length).to.equal(1);
      });

      it('should delete sim', () => {
        WorkbookEditorWrapper.setState({ ...Oscillations });

        WorkbookEditorWrapper.setState({ curSlide: 0 });

        WorkbookEditorInstance.deleteSim(0);

        expect(WorkbookEditorWrapper.state().slides[0].iframes.length).to.equal(0);
      });
    });

    describe('Interact and draw mode toggle', () => {
      it('should correctly enable and disable pointer events in canvas', () => {
        expect(getComputedStyle(WorkbookEditorWrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('auto');
        expect(WorkbookEditorInstance.state.interactEnabled).to.equal(false);

        WorkbookEditorInstance.toggleInteract();

        expect(getComputedStyle(wrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('none');
        expect(WorkbookEditorInstance.state.interactEnabled).to.equal(true);

        wrapper.unmount();
      });
    });
  });
}
