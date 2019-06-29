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
  import { CreateWorkbook } from './CreateWorkbook';
  import { Oscillations, Oscillations1 } from './CreateWorkbookTestData.js';

  configure({ adapter: new Adapter() });

  describe('CreateWorkbook', () => {
    let div;
    let wrapper;
    let CreateWorkbookWrapper;
    let CreateWorkbookInstance;

    describe('Mounting of CreateWorkbook', () => {
      before(() => {
        div = document.createElement('div');
        window.domNode = div;
        document.body.appendChild(div);
      });

      it('should mount successfully', () => {
        wrapper = mount(
          <Router history={createMemoryHistory()}>
            <Route path="/" render={() => <CreateWorkbook workbookExists />} />
          </Router>,
          { attachTo: window.domNode },
        );
        CreateWorkbookWrapper = wrapper.find(CreateWorkbook);
        CreateWorkbookInstance = CreateWorkbookWrapper.instance();
        CreateWorkbookWrapper.setState({ ...Oscillations });
        CreateWorkbookWrapper.setState({ initialized: true });
      });
    });

    describe('Addition and deletion of slide', () => {
      it('(no of slides = 2, curSlide = 1), after insertion of slide, slides length = 3, curSlide = 2', () => {
        CreateWorkbookWrapper.setState({
          curSlide: 1,
          slides: [{ notes: '0', iframes: [], textboxes: [] }, { notes: '1', iframes: [], textBoxes: [] }],
        });

        CreateWorkbookInstance.addNewSlide();

        expect(CreateWorkbookWrapper.state().slides.length).to.equal(3);
        expect(CreateWorkbookWrapper.state().curSlide).to.equal(2);
      });

      it('(no of slides = 2, curSlide = 1), after deletion, curSlide should be 0 and content of slide 0 should be displayed', () => {
        CreateWorkbookWrapper.setState({ curSlide: 1, ...Oscillations });

        const slideToShowAfterDeletion = CreateWorkbookWrapper.state().slides[0];

        CreateWorkbookInstance.deleteSlide(1);
        expect(CreateWorkbookWrapper.state().curSlide).to.equal(0);
        expect(
          CreateWorkbookWrapper.state().slides[CreateWorkbookWrapper.state().curSlide],
        ).to.deep.include(slideToShowAfterDeletion);
      });

      it('(no of slides = 1, curSlide = 0), after deletion, curSlide should be 0 and slides should reset', () => {
        CreateWorkbookWrapper.setState({
          curSlide: 0,
          slides: [{ notes: '', iframes: [], textboxes: [] }],
        });

        CreateWorkbookInstance.deleteSlide(0);

        expect(CreateWorkbookWrapper.state().curSlide).to.equal(0);
        expect(CreateWorkbookWrapper.state().slides[0].notes).to.not.equal('');
      });

      it('(no of slides = 3, curSlide = 1, deletedSlide = 1), after deletion curSlide should be 1 and contents of next slide should be displayed', () => {
        CreateWorkbookWrapper.setState({ curSlide: 1, ...Oscillations1 });

        const slideToShowAfterDeletion = CreateWorkbookInstance.state.slides[2];

        CreateWorkbookInstance.deleteSlide(1);

        expect(CreateWorkbookInstance.state.slides[CreateWorkbookInstance.state.curSlide])
          .to
          .deep
          .include(slideToShowAfterDeletion);
      });
    });

    describe('Navigation between slides', () => {
      it('(no of slides = 2, curSlide = 1), after navigation to slide 0, contents of slide 0 should be displayed', () => {
        CreateWorkbookWrapper.setState({ curSlide: 1, ...Oscillations });

        CreateWorkbookInstance.changeSlide(0);

        expect(CreateWorkbookWrapper.state().curSlide).to.equal(0);
        expect(
          CreateWorkbookWrapper.state().slides[CreateWorkbookWrapper.state().curSlide],
        ).to.deep.include(CreateWorkbookWrapper.state().slides[0]);
      });
    });

    describe('Textbox', () => {
      it('should insert a textbox', () => {
        CreateWorkbookWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });
        CreateWorkbookInstance.addTextBox();
        expect(CreateWorkbookWrapper.state().slides[0].textboxes[0].value).to.equal('new text box');
      });

      it('should delete a textbox', () => {
        CreateWorkbookWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [{ value: 'sample value' }] }],
        });
        CreateWorkbookInstance.deleteTextBox(0);
        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Undo and redo', () => {
      it('checks the working of undo', () => {
        CreateWorkbookWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        // Clear undo stacks to remove the items during the last test
        CreateWorkbookInstance.undoStacks = [];

        CreateWorkbookInstance.addTextBox();
        CreateWorkbookInstance.addTextBox();
        CreateWorkbookInstance.addTextBox();

        CreateWorkbookInstance.undo();
        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(2);

        CreateWorkbookInstance.undo();
        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(1);

        CreateWorkbookInstance.undo();
        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(0);

        CreateWorkbookInstance.undo();
        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(0);

        CreateWorkbookInstance.addTextBox();
        CreateWorkbookInstance.deleteTextBox(0);

        CreateWorkbookInstance.undo();
        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(1);
      });

      it('checks the working of redo', () => {
        CreateWorkbookWrapper.setState({
          slides: [{ notes: '0', iframes: [], textboxes: [] }],
        });

        CreateWorkbookInstance.addTextBox();

        CreateWorkbookInstance.undo();

        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(0);

        CreateWorkbookInstance.redo();

        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(1);

        CreateWorkbookInstance.deleteTextBox(0);

        CreateWorkbookInstance.undo();
        CreateWorkbookInstance.redo();

        expect(CreateWorkbookWrapper.state().slides[0].textboxes.length).to.equal(0);
      });
    });

    describe('Changing size of the canvas', () => {
      it('checks the working of increase canvas size', () => {
        CreateWorkbookWrapper.setState({ ...Oscillations });

        CreateWorkbookInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        CreateWorkbookInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1500px');

        expect(CreateWorkbookWrapper.state().slides[0].note)
          .to
          .equal(Oscillations.slides[0].note);

        // Revert the changes
        CreateWorkbookInstance.changePageCount(-1);
        CreateWorkbookInstance.changePageCount(-1);
      });

      it('checks the working of decrease canvas size', () => {
        CreateWorkbookWrapper.setState({ ...Oscillations });

        CreateWorkbookInstance.changePageCount(1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('1200px');

        CreateWorkbookInstance.changePageCount(-1);

        expect(
          getComputedStyle(wrapper.find('.canvas-cont').at(0).getDOMNode()).getPropertyValue('height'),
        ).to.equal('900px');
      });

      it('should not reduce the size of the canvas if a textbox/sim overflows after the reduction ( checkCanvasSize returns 1)', () => {
        CreateWorkbookWrapper.setState({ ...Oscillations });
        CreateWorkbookInstance.changePageCount(1); // canvas size set to 1200px
        CreateWorkbookWrapper.setState({
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
        expect(CreateWorkbookInstance.checkCanvasSize()).to.equal(1);
      });
    });

    describe('Addition and deletion of sim', () => {
      it('should add a sim to the current slide', () => {
        CreateWorkbookWrapper.setState({ ...Oscillations });

        CreateWorkbookWrapper.setState({ curSlide: 1 });

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

        expect(CreateWorkbookWrapper.state().slides[1].iframes.length).to.equal(1);
      });

      it('should delete sim', () => {
        CreateWorkbookWrapper.setState({ ...Oscillations });

        CreateWorkbookWrapper.setState({ curSlide: 0 });

        CreateWorkbookInstance.deleteSim(0);

        expect(CreateWorkbookWrapper.state().slides[0].iframes.length).to.equal(0);
      });
    });

    describe('Interact and draw mode toggle', () => {
      it('should correctly enable and disable pointer events in canvas', () => {
        expect(getComputedStyle(CreateWorkbookWrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('auto');
        expect(CreateWorkbookInstance.state.interactEnabled).to.equal(false);

        CreateWorkbookInstance.interact();

        expect(getComputedStyle(wrapper.find('canvas').at(0).getDOMNode()).getPropertyValue('pointer-events')).to.equal('none');
        expect(CreateWorkbookInstance.state.interactEnabled).to.equal(true);

        wrapper.unmount();
      });
    });
  });
}
