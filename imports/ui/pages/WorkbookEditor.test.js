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

    1) Mounting of Component -check
    2) Addition and deletion ( different cases ) - check
    3) Navigation between slides -check
    4) Addition / deletion of textboxes -check
    4) Interact and draw - check
    5) Undo and redo - check
    6) Changing size of canvas (conditional also) - check
    5) Addition / deletion of simulations - check
    8) Interact and draw mode - check
*/

if (Meteor.isClient) {
  import Adapter from 'enzyme-adapter-react-16';
  import { workbookEditor } from './WorkbookEditor';
  import { Oscillations, Oscillations1 } from './WorkbookEditorTestData.js';

  configure({ adapter: new Adapter() });

  describe('workbookEditor', () => {
    let div;
    let wrapper;
    let workbookEditorWrapper;
    let workbookEditorInstance;

    describe('Mounting of workbookEditor', () => {
      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should mount successfully', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <workbookEditor workbookExists />} />
          </Router>,
          { attachTo: window.domNode },
        );
        workbookEditorWrapper = wrapper.find(workbookEditor);
        workbookEditorInstance = workbookEditorWrapper.instance();
        workbookEditorWrapper.setState({ ...Oscillations });
        workbookEditorWrapper.setState({ initialized: true });
      });
    });

    describe('Addition and deletion of slide', () => {
      it('(no of slides = 2, curSlide = 1), after insertion of slide, slides length = 3, curSlide = 2', () => {
        workbookEditorWrapper.setState({
          curSlide: 1,
          slides: [{ notes: '0', iframes: [], textboxes: [] }, { notes: '1', iframes: [], textBoxes: [] }],
        });

        workbookEditorInstance.addNewSlide();

        expect(workbookEditorWrapper.state().slides.length).to.equal(3);
        expect(workbookEditorWrapper.state().curSlide).to.equal(2);
      });

      it('(no of slides = 2, curSlide = 1), after deletion, curSlide should be 0 and content of slide 0 should be displayed', () => {
        workbookEditorWrapper.setState({ curSlide: 1, ...Oscillations });

        const slideToShowAfterDeletion = workbookEditorWrapper.state().slides[0];

        workbookEditorInstance.deleteSlide(1);
        expect(workbookEditorWrapper.state().curSlide).to.equal(0);
        expect(
          workbookEditorWrapper.state().slides[workbookEditorWrapper.state().curSlide],
        ).to.deep.include(slideToShowAfterDeletion);
      });

      it('(no of slides = 1, curSlide = 0), after deletion, curSlide should be 0 and slides should reset', () => {
        workbookEditorWrapper.setState({
          curSlide: 0,
          slides: [{ notes: '', iframes: [], textboxes: [] }],
        });

        workbookEditorInstance.deleteSlide(0);

        expect(workbookEditorWrapper.state().curSlide).to.equal(0);
        expect(workbookEditorWrapper.state().slides[0].notes).to.not.equal('');
      });

      it('(no of slides = 3, curSlide = 1, deletedSlide = 1), after deletion curSlide should be 1 and contents of next slide should be displayed', () => {
        workbookEditorWrapper.setState({ curSlide: 1, ...Oscillations1 });

        const slideToShowAfterDeletion = workbookEditorInstance.state.slides[2];

        workbookEditorInstance.deleteSlide(1);

        expect(workbookEditorInstance.state.slides[workbookEditorInstance.state.curSlide])
          .to
          .deep
          .include(slideToShowAfterDeletion);
      });
    });

    describe('Navigation between slides', () => {
      it('(no of slides = 2, curSlide = 1), after navigation to slide 0, contents of slide 0 should be displayed', () => {
        workbookEditorWrapper.setState({ curSlide: 1, ...Oscillations });

        workbookEditorInstance.changeSlide(0);

        expect(workbookEditorWrapper.state().curSlide).to.equal(0);
        expect(
          workbookEditorWrapper.state().slides[workbookEditorWrapper.state().curSlide],
        ).to.deep.include(workbookEditorWrapper.state().slides[0]);
      });
    });

    describe('Textbox', () => {
      it('should insert a textbox', () => {
        workbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });
        workbookEditorInstance.addTextBox();
        expect(workbookEditorWrapper.state().slides[0].textboxes[0].value).to.equal('new text box');
      });

      it('should delete a textbox', () => {
        workbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [{ value: 'sample value' }] }],
        });
        workbookEditorInstance.deleteTextBox(0);
        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Undo and redo', () => {
      it('checks the working of undo', () => {
        workbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        // Clear undo stacks to remove the items during the last test
        workbookEditorInstance.undoStacks = [];

        workbookEditorInstance.addTextBox();
        workbookEditorInstance.addTextBox();
        workbookEditorInstance.addTextBox();

        workbookEditorInstance.undo();
        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(2);

        workbookEditorInstance.undo();
        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(1);

        workbookEditorInstance.undo();
        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);

        workbookEditorInstance.undo();
        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);

        workbookEditorInstance.addTextBox();
        workbookEditorInstance.deleteTextBox(0);

        workbookEditorInstance.undo();
        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(1);
      });

      it('checks the working of redo', () => {
        workbookEditorWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        workbookEditorInstance.addTextBox();

        workbookEditorInstance.undo();

        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);

        workbookEditorInstance.redo();

        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(1);

        workbookEditorInstance.deleteTextBox(0);

        workbookEditorInstance.undo();
        workbookEditorInstance.redo();

        expect(workbookEditorWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Changing size of the canvas', () => {
      it('checks the working of increase canvas size', () => {
        workbookEditorWrapper.setState({ ...Oscillations });

        workbookEditorInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        workbookEditorInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1500px');

        expect(workbookEditorWrapper.state().slides[0].note)
          .to
          .equal(Oscillations.slides[0].note);

        // Revert the changes
        workbookEditorInstance.changePageCount(-1);
        workbookEditorInstance.changePageCount(-1);
      });

      it('checks the working of decrease canvas size', () => {
        workbookEditorWrapper.setState({ ...Oscillations });

        workbookEditorInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        workbookEditorInstance.changePageCount(-1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('900px');
      });

      it('should not reduce the size of the canvas if a textbox/sim overflows after the reduction ( checkCanvasSize returns 1)', () => {
        workbookEditorWrapper.setState({ ...Oscillations });
        workbookEditorInstance.changePageCount(1); // canvas size set to 1200px
        workbookEditorWrapper.setState({
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
        expect(workbookEditorInstance.checkCanvasSize()).to.equal(1);
      });
    });

    describe('Addition and deletion of sim', () => {
      it('should add a sim to the current slide', () => {
        workbookEditorWrapper.setState({ ...Oscillations });

        workbookEditorWrapper.setState({ curSlide: 1 });

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

        expect(workbookEditorWrapper.state().slides[1].iframes.length).to.equal(1);
      });

      it('should delete sim', () => {
        workbookEditorWrapper.setState({ ...Oscillations });

        workbookEditorWrapper.setState({ curSlide: 0 });

        workbookEditorInstance.deleteSim(0);

        expect(workbookEditorWrapper.state().slides[0].iframes.length).to.equal(0);
      });
    });

    describe('Interact and draw mode toggle', () => {
      it('should correctly enable and disable pointer events in canvas', () => {
        expect(getComputedStyle(workbookEditorWrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('auto');
        expect(workbookEditorInstance.state.interactEnabled).to.equal(false);

        workbookEditorInstance.interact();

        expect(getComputedStyle(wrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('none');
        expect(workbookEditorInstance.state.interactEnabled).to.equal(true);

        wrapper.unmount();
      });
    });
  });
}
