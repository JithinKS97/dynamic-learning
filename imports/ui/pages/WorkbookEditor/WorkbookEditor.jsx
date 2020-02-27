/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-danger */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-control-regex */
import React from 'react';
import { Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import TextBoxes from '../../components/workbook/TextBoxes';
import MCQs from '../../components/workbook/MCQs';
import ShortResponses from '../../components/workbook/ShortResponses';
import SlidesList from '../../components/workbook/List';
import SimsList from '../../components/SimsList';
import { Workbooks } from '../../../api/workbooks';
import DrawingBoardCmp from '../../components/workbook/DrawingBoardCmp';

import {
  renderResponseModal,
  renderDescriptionModal,
  renderAddDescription,
  renderEditDescription,
  renderLoginNotificationModal,
  renderWorkBookTitleModal,
} from './Modals';

import { renderRightMenu, renderLeftMenuHeader } from './Menu';

/*
 * renders the page in which teachers create, edit, save and present workbooks
 */
export class WorkbookEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      title: true,
      curSlide: 0,
      slides: [],
      _id: '',
      initialized: false,
      loginNotification: false,
      redirectToLogin: false,
      interactEnabled: false,
      redirectToDashboard: false,
      forkedWorkbookId: null,
      author: '',
      copied: false,
      scaleX: 1,
      description: [],
      showDescription: false,
      showAddDescription: false,
      showEditDescription: false,
      saving: false,
      descriptionExists: false,
    };

    this.pageCount = 0;

    this.undoStacks = [];
    this.redoStacks = [];

    this.savingChanges = false;

    this.copiedObject = {};
  }

  componentDidMount() {
    this.db = this.drawingBoard;

    window.onresize = this.handleWindowResize;
    window.addEventListener('keydown', this.handleKeyDown, false);

    this.handleWindowResize();
    $(window).scroll(this.handleScroll);

    $('body').css('background-color', '#102028');
  }

  componentWillReceiveProps(nextProps) {
    // eslint-disable-next-line react/prop-types
    const { workbookExists, workbook } = nextProps;

    if (workbookExists === false) return;
    this.setState(
      {
        ...workbook,
        initialized: true,
        workbookExists,
        // eslint-disable-next-line max-len
        descriptionExists: !(Object.keys(workbook.description).length === 0 && workbook.description.constructor === Object),
      },
      () => {
        const { slides } = this.state;

        this.toggleInteract();

        if (slides.length === 0) {
          this.addNewSlide();
        } else {
          this.changeSlide(0);
        }
      },
    );
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown, false);
    window.removeEventListener('scroll', this.handleScroll, false);
    window.removeEventListener('resize', this.handleWindowResize, false);
    window.removeEventListener('keydown', this.handleKeyDown, false);
    $('body').css('background-color', 'white');
  }

  /**
   * Calculates and set scaleX, the factor by which the canvas container should be
   * scaled so that it fits the window
   */
  handleWindowResize = () => {
    this.setState({
      scaleX:
        (document.getElementsByClassName('canvas-outer-most-container')[0].offsetWidth - 14)
        / 1366,
    });
    this.handleScroll();
    this.forceUpdate();
  };

  /**
   * Finds the top offset of the drawing board controls when scrolled down
   */
  handleScroll = () => {
    if (Meteor.isTest) return;

    const { scaleX } = this.state;
    let scrollTop = $(window).scrollTop();
    // While finding the top offset, we need to take into account of the scale factor also
    if (scrollTop > 10) {
      scrollTop -= 60;
    }
    $('.drawing-board-controls-wrapper')[0].style.top = `${scrollTop / scaleX}px`;
  };

  /**
   * Deals with actions to be performed when shortcut keys are pressed
   */
  handleKeyDown = (e) => {
    if (e.keyCode >= 37 && e.keyCode <= 40) {
      e.preventDefault();
    }

    if (e.keyCode === 67 && e.ctrlKey) {
      this.copiedObject = this.db.copy();
    }

    if (e.keyCode === 86 && e.ctrlKey) {
      if (this.copiedObject) {
        this.db.paste(this.copiedObject);
        this.copiedObject = null;
        this.onChange();
      }
    }

    if (e.keyCode === 46) {
      this.db.b.remove(...this.db.b.getActiveObjects());
      this.db.b.discardActiveObject().renderAll();
      this.onChange();
    }

    if (e.keyCode === 90 && e.ctrlKey) this.undo();

    if (e.keyCode === 89 && e.ctrlKey) this.redo();

    if (e.keyCode === 83 && e.ctrlKey) {
      e.preventDefault();
      this.saveToDatabase();
    }

    if (e.keyCode === 68 && e.ctrlKey) {
      e.preventDefault();
      this.toggleInteract();
    }
  };

  saveAfterReset = () => {
    const { slides, curSlide } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    clonedSlides[curSlide].note = this.db.getImg();
    this.setState({
      slides: clonedSlides,
    });
  };

  /**
   * Finds and sets the height of the canvas according to the pagecount
   */
  setSizeOfPage = (pageCount) => {
    /**
     * The height when page count = 0 is 900px and for every additional pagecount,
     * the height is increased by 300px
     */
    $('.canvas-container')[0].style.height = `${900 + pageCount * 300}px`;
    $('.upper-canvas')[0].style.height = $('.canvas-container')[0].style.height;
    $('.lower-canvas')[0].style.height = $('.canvas-container')[0].style.height;
    $('.upper-canvas')[0].height = 900 + pageCount * 300;
    $('.lower-canvas')[0].height = 900 + pageCount * 300;
    this.db.b.setHeight($('.upper-canvas')[0].height);
  };

  /**
   * Triggered when somebody object gets added to the canvas
   */
  onChange = () => {
    const { slides } = this.state;
    const { curSlide } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    const note = this.db.getImg();
    clonedSlides[curSlide].note = note;
    clonedSlides[curSlide].pageCount = this.pageCount;
    this.updateSlides(clonedSlides);
  };

  addNewSlide = () => {
    let { curSlide } = this.state;
    const { slides } = this.state;

    this.pushSlide();

    curSlide = slides.length - 1;
    // When a slide is added, the current slide is updated to that
    this.changeSlide(curSlide);
  };

  setStateAfterRearranging = (rearrangedSlide, toSlideNo) => {
    /**
     * The function is called after rearraging the slide in the slidesList
     * This is done by dragging and swapping the slide
     */
    this.setState({
      slides: rearrangedSlide,
    }, () => {
      this.changeSlide(toSlideNo);
    });
  };

  pushSlide = () => {
    const { slides } = this.state;

    const newSlide = {
      note: [],
      iframes: [],
      pageCount: 0,
      textboxes: [],
      questions: [],
      shortresponse: [],
    };

    slides.push(newSlide);

    this.updateSlides(slides);
  };

  reset = () => {
    this.setState(
      {
        curSlide: 0,
        slides: [],
      },
      () => {
        this.addNewSlide();
        this.setSizeOfPage(0);
        this.db.reset();
      },
    );
  };

  saveToDatabase = () => {
    if (!Meteor.userId()) {
      this.setState({ loginNotification: true });
      return;
    }

    if (this.addSim.state.isOpen) return;

    const { userId, title, slides } = this.state;

    // If the user is not the owner of the workbook
    // They need to fork before saving
    if (userId !== Meteor.userId()) {
      if (!confirm(
        'Are you sure you want to fork this workbook?',
      )) return;

      Meteor.call('workbooks.insert', title, (err, id) => {
        Meteor.call('workbooks.update', id, slides);

        this.setState(
          {
            redirectToDashboard: true,
            forkedWorkbookId: id,
          },
          () => {
            confirm('Forked succesfully');
          },
        );
      });
    } else {
      const { _id } = this.state;

      const workbook = Workbooks.findOne({ _id });

      try {
        // Checking if the workbook to be saved is same as that in the database
        // If so, no need to save
        expect({ slides: workbook.slides }).to.deep.include({
          slides,
        });
      } catch (error) {
        if (error) {
          this.setState({
            saving: true,
          });
          Meteor.call('workbooks.update', _id, slides, () => {
            alert('Saved successfully');
            this.setState({
              saving: false,
            });
          });
        }
      }
    }
  };

  /**
   * Pushes the current slide state to the undoStacks
   * undoStacks is an array in which each element is an array
   * that stores the states of slides
   */
  pushToUndoStacks = (oldSlide) => {
    const { curSlide } = this.state;

    this.undoStacks[curSlide] = this.undoStacks[curSlide] || [];

    // Checks if the slide state to be saved is same as
    // that already present at the top of the stack
    try {
      expect(oldSlide).to.deep.include(
        this.undoStacks[curSlide][this.undoStacks[curSlide].length - 1],
      );
    } catch (error) {
      if (error) {
        // If the slide state is different, its pushed to the stack
        this.undoStacks[curSlide].push(oldSlide);
      }
    }
  };

  /**
   * Changes the current slide
   */
  changeSlide = (toSlideNo) => {
    const { slides } = this.state;
    this.setState(
      {
        curSlide: toSlideNo,
      },
      () => {
        this.pageCount = slides[toSlideNo].pageCount || 0;
        this.setSizeOfPage(this.pageCount);
        this.db.reset();
        this.db.setImg(slides[toSlideNo].note);
        this.simsList.loadDataToSketches();
      },
    );
  };

  /**
   * Updates the slides states
   */
  updateSlides = (clonedSlides, shouldNotLoad, shouldNotPushToUndoStack) => {
    const { slides, curSlide } = this.state;
    const slide = slides[curSlide];
    if (!shouldNotPushToUndoStack) this.pushToUndoStacks(slide);

    this.setState(
      {
        slides: clonedSlides,
      },
      () => {
        if (shouldNotLoad) return;

        this.simsList.loadDataToSketches();
      },
    );
  };

  deleteSlide = (index) => {
    const { slides } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));

    if (clonedSlides.length !== 1) {
      clonedSlides.splice(index, 1);

      let { curSlide } = this.state;
      this.undoStacks.splice(index, 1);

      if (index === 0) {
        curSlide = 0;
      }
      if (curSlide === clonedSlides.length) { curSlide = clonedSlides.length - 1; }

      this.changeSlide(curSlide);
      this.updateSlides(clonedSlides);
    } else {
      this.undoStacks = [];
      this.reset();
    }
  };

  deleteSim = (index) => {
    const { slides } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    const { curSlide } = this.state;
    const { iframes } = clonedSlides[curSlide];
    iframes.splice(index, 1);
    clonedSlides[curSlide].iframes = iframes;
    this.updateSlides(clonedSlides);
  };

  deleteQuestion = (index) => {
    const { slides, curSlide } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    const { questions } = clonedSlides[curSlide];
    questions.splice(index, 1);
    clonedSlides[curSlide].questions = questions;
    this.updateSlides(clonedSlides);
  };

  deleteShortResponse = (index) => {
    const { slides, curSlide } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    const { shortresponse } = clonedSlides[curSlide];
    shortresponse.splice(index, 1);
    clonedSlides[curSlide].shortresponse = shortresponse;
    this.updateSlides(clonedSlides);
  };

  deleteTextBox = (index) => {
    const { slides } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    const { curSlide } = this.state;
    const { textboxes } = clonedSlides[curSlide];
    textboxes.splice(index, 1);
    clonedSlides[curSlide].textboxes = textboxes;
    this.updateSlides(clonedSlides);
  };

  toggleInteract = () => {
    const { interactEnabled } = this.state;

    if (this.addSim.state.isOpen) return;

    if (!interactEnabled) {
      $('.upper-canvas')[0].style['pointer-events'] = 'none';
      $('.lower-canvas')[0].style['pointer-events'] = 'none';
    } else {
      $('.upper-canvas')[0].style['pointer-events'] = 'unset';
      $('.lower-canvas')[0].style['pointer-events'] = 'unset';
    }

    this.setState(state => ({
      interactEnabled: !state.interactEnabled,
    }));
  };

  /**
   * Checks if the reduced canvas size is less than bottom point of
   * bottom most text area or iframe
   */
  checkCanvasSize = () => {
    let maxHeight = -Infinity;

    let j = $('textarea').length;
    let textarea;

    // Loop finds the bottom most point of the bottom most textarea
    // Stores it in maxHeight
    while (j > 0) {
      j -= 1;
      textarea = $('textarea')
        .eq(j)
        .parents()
        .eq(1);
      if (textarea.position().top + textarea.height() > maxHeight) {
        maxHeight = textarea.position().top + textarea.height();
      }
    }

    let i = $('iframe').length;
    let iframe;

    while (i > 0) {
      i -= 1;
      iframe = $('iframe')
        .eq(i - 1)
        .parents()
        .eq(3);
      if (iframe.position().top + iframe.height() > maxHeight) {
        maxHeight = iframe.position().top + iframe.height();
      }
    }

    const { scaleX } = this.state;

    // If the reduced height is less than maxHeight, returns 1
    // In this case, the canvas size should not be reduced
    if (($('.canvas-cont').height() - 300) * scaleX < maxHeight) return 1;

    return 0;
  };

  undo = () => {
    const { curSlide, slides } = this.state;

    // The latest saved state is popped off the undoStacks
    const slide = this.undoStacks[curSlide].pop();

    // When undo is performed, the latest saved state is
    // stored to the redo stacks
    if (!this.redoStacks[curSlide]) {
      this.redoStacks[curSlide] = [];
    }

    if (slide) {
      this.redoStacks[curSlide].push(slides[curSlide]);
      this.restoreStateBack(slide);
    }
  };

  redo = () => {
    const { curSlide, slides } = this.state;

    const slide = this.redoStacks[curSlide].pop();

    if (slide) {
      this.undoStacks[curSlide].push(slides[curSlide]);
      this.restoreStateBack(slide);
    }
  };

  /**
   * Applies the state restored during undo or redo back
   */
  restoreStateBack = (slide) => {
    const { slides, curSlide } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    clonedSlides[curSlide] = slide;

    this.setState(
      {
        slides: clonedSlides,
      },
      () => {
        // eslint-disable-next-line no-shadow
        const { curSlide, slides } = this.state;
        this.pageCount = slides[curSlide].pageCount || 0;

        this.setSizeOfPage(this.pageCount);
        this.simsList.loadDataToSketches();
        this.db.reset();
        this.db.setImg(slides[curSlide].note);

        // If after restoring the not in the slide is empty
        // The drawingboard needs to be explicitly reset
        if (!slides[curSlide].note) {
          this.db.reset();
        }
      },
    );
  };

  headToRequestPage = () => {
    this.setState({ redirectToRequest: true });
  };

  /**
   * Increases or decreases the size of the canvas
   * @param {Integer} option - option = 1, used to increase
   *                           option = 2, used to decrease
   */
  changePageCount = (option) => {
    const temp = this.db.getImg();
    this.pageCount += option;
    $('.upper-canvas')[0].style.height = `${(
      $('.upper-canvas')[0].height
      + option * 300
    ).toString()}px`;
    $('.lower-canvas')[0].style.height = `${(
      $('.lower-canvas')[0].height
      + option * 300
    ).toString()}px`;
    $('.upper-canvas')[0].height += option * 300;
    $('.lower-canvas')[0].height += option * 300;
    $('.canvas-container')[0].style.height = $('.lower-canvas')[0].style.height;
    this.db.b.setHeight($('.upper-canvas')[0].height);
    this.db.setImg(temp);
    const { slides, curSlide } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));
    clonedSlides[curSlide].pageCount = this.pageCount;
    this.updateSlides(clonedSlides);
  };

  addShortResponse = () => {
    const { curSlide, slides } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));

    if (!clonedSlides[curSlide].shortresponse) {
      clonedSlides[curSlide].shortresponse = [];
    }

    const newQuestion = {
      content: '',
      response: '',
    };

    clonedSlides[curSlide].shortresponse.push(newQuestion);
    this.updateSlides(clonedSlides);
    this.setState({ question: false });
  };

  addMCQ = () => {
    const { curSlide, slides } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));

    if (!clonedSlides[curSlide].questions) {
      clonedSlides[curSlide].questions = [];
    }

    const newQuestion = {
      content: '',
      a: '',
      b: '',
      c: '',
      d: '',
      response: '',
    };

    clonedSlides[curSlide].questions.push(newQuestion);
    this.updateSlides(clonedSlides);
    this.setState({ question: false });
  };

  addQuestion = () => {
    this.setState({ question: true });
  };

  addTextBox = () => {
    const { curSlide, slides } = this.state;
    const clonedSlides = Object.values($.extend(true, {}, slides));

    if (!clonedSlides[curSlide].textboxes) {
      clonedSlides[curSlide].textboxes = [];
    }

    const newTextBox = {
      value: 'new text box',
    };

    clonedSlides[curSlide].textboxes.push(newTextBox);

    this.updateSlides(clonedSlides);
  };

  handleAddDescription = () => {
    this.setState({
      showAddDescription: true,
    });
  };

  handleShowDescription = () => {
    this.setState({
      showDescription: true,
    });
  }

  handleShowEditDescription = () => {
    this.setState({
      showEditDescription: true,
    });
  }

  setCopiedState = (set) => {
    if (set) this.setState({ copied: true });
    else this.setState({ copied: false });
  };

  addDescription = () => {
    this.setState({ showEditDescription: false });
    this.setState({ showAddDescription: false });

    let subject;
    let topic;
    let learningObjectives;
    let inClassActivities;
    let resources;
    let assessments;
    let standards;

    if (this.subject.value === '') {
      subject = this.subject.placeholder;
    } else {
      subject = this.subject.value;
    }

    if (this.topic.value === '') {
      topic = this.topic.placeholder;
    } else {
      topic = this.topic.value;
    }

    if (this.learningObjectives.value === '') {
      learningObjectives = this.learningObjectives.placeholder;
    } else {
      learningObjectives = this.learningObjectives.value;
    }

    if (this.inClassActivities.value === '') {
      inClassActivities = this.inClassActivities.placeholder;
    } else {
      inClassActivities = this.inClassActivities.value;
    }

    if (this.resources.value === '') {
      resources = this.resources.placeholder;
    } else {
      resources = this.resources.value;
    }

    if (this.assessments.value === '') {
      assessments = this.assessments.placeholder;
    } else {
      assessments = this.assessments.value;
    }

    if (this.standards.value === '') {
      standards = this.standards.placeholder;
    } else {
      standards = this.standards.value;
    }

    const description = {
      subject,
      topic,
      learningObjectives,
      inClassActivities,
      resources,
      assessments,
      standards,
    };

    const { _id } = this.state;

    Meteor.call('workbooks.description', _id, description, () => {
      alert('Description addedd successfully');
    });
  };

  checkDescExist = () => {
    const { _id } = this.state;
    const a = Workbooks.find({
      _id,
      description: { $exists: true },
    }).fetch();
    if (a.length !== 0) return true;

    Meteor.call('workbooks.addDescriptionField', _id);
  };

  checkDescription = () => this.state.descriptionExists;

  calcHeightOfCanvasContainer = () => {
    const { slides, curSlide } = this.state;
    if (slides.length > 0) {
      return 900 + slides[curSlide].pageCount * 300;
    }
    return 900;
  };

  handleRedirectToDashboard = () => {
    const {
      slides,
      _id,
    } = this.state;
    const workbook = Workbooks.findOne({
      _id,
    });

    try {
      expect({ slides: workbook.slides }).to.deep.include({
        slides,
      });
    } catch (error) {
      if (slides[0].note.length === 0 && slides.length === 1) {
        this.setState({
          redirectToDashboard: true,
        });
        return;
      }
      if (error) {
        if (
          !confirm(
            'Are you sure you want to leave. Any unsaved changes will be lost!',
          )
        ) {
          return;
        }
      }
    }

    this.setState({
      redirectToDashboard: true,
    });
  }

  render() {
    const {
      redirectToLogin,
      redirectToDashboard,
      // eslint-disable-next-line no-unused-vars
      initialized,
      scaleX,
      slides,
      curSlide,
      copied,
      interactEnabled,
      userId,
      title,
    } = this.state;
    if (redirectToLogin) {
      return <Redirect to="/login" />;
    }

    if (redirectToDashboard) {
      if (this.props.location.state) {
        if (this.props.location.state.from === 'teacherclasses') {
          return <Redirect to="/dashboard/classes" />;
        }
      }
      return <Redirect to="/dashboard/workbooks" />;
    }
    return (
      <>
        {renderLoginNotificationModal(this)}
        {renderWorkBookTitleModal(this)}
        {renderResponseModal(this)}
        {renderAddDescription(this)}
        {renderDescriptionModal(this)}
        {renderEditDescription(this)}
        <div>
          <Dimmer active={!initialized}>
            <Loader />
          </Dimmer>
          <div
            style={{
              height: `${this.calcHeightOfCanvasContainer() * scaleX}px`,
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                padding: 0,
                flex: 1.5,
              }}
              className="workbook-editor__slides-list"
            >
              {renderLeftMenuHeader(this)}
              <div
                style={{
                  padding: '0 1rem',
                }}
              >
                <SlidesList
                  slides={slides}
                  curSlide={curSlide}
                  deleteSlide={this.deleteSlide}
                  setStateAfterRearranging={this.setStateAfterRearranging}
                  changeSlide={this.changeSlide}
                />
              </div>
            </div>
            <div
              className="canvas-outer-most-container"
              style={{
                margin: '0 auto',
                padding: '1rem',
                overflowX: 'hidden',
                overflowY: 'hidden',
                height: `${this.calcHeightOfCanvasContainer() * scaleX}px`,
                flex: 10,
              }}
            >
              <h1 style={{ color: 'white' }}>{title}</h1>
              <div
                className="canvas-cont"
                style={{
                  backgroundColor: 'black',
                  width: '1366px',
                  transform: `scale(${scaleX},${scaleX})`,
                  transformOrigin: 'top left',
                }}
              >
                <TextBoxes
                  slides={slides}
                  curSlide={curSlide}
                  updateSlides={this.updateSlides}
                  deleteTextBox={this.deleteTextBox}
                  isPreview={false}
                  setCopiedState={this.setCopiedState}
                  scale={scaleX}
                />

                <MCQs
                  slides={slides}
                  curSlide={curSlide}
                  updateSlides={this.updateSlides}
                  deleteQuestion={this.deleteQuestion}
                  isPreview={false}
                  setCopiedState={this.setCopiedState}
                  userId={userId}
                  scale={scaleX}
                />
                <ShortResponses
                  slides={slides}
                  curSlide={curSlide}
                  updateSlides={this.updateSlides}
                  deleteShortResponse={this.deleteShortResponse}
                  isPreview={false}
                  setCopiedState={this.setCopiedState}
                  userId={userId}
                  scale={scaleX}
                />
                <SimsList
                  slides={slides}
                  curSlide={curSlide}
                  updateSlides={this.updateSlides}
                  deleteSim={this.deleteSim}
                  isPreview={false}
                  setCopiedState={this.setCopiedState}
                  isRndRequired
                  undo={this.undo}
                  redo={this.redo}
                  ref={(e) => {
                    this.simsList = e;
                  }}
                  save={this.saveToDatabase}
                  interact={this.toggleInteract}
                  scale={scaleX}
                />
                <DrawingBoardCmp
                  interactEnabled={interactEnabled}
                  interact={this.toggleInteract}
                  showToolbar
                  ref={(e) => {
                    this.drawingBoard = e;
                  }}
                  curSlide={curSlide}
                  undo={this.undo}
                  redo={this.redo}
                  addQuestion={this.addQuestion}
                  handleAddDescription={this.handleAddDescription}
                  addTextBox={this.addTextBox}
                  copied={copied}
                  updateSlides={this.updateSlides}
                  slides={slides}
                  userId={userId}
                  onChange={this.onChange}
                  saveToDatabase={this.saveToDatabase}
                  saveAfterReset={this.saveAfterReset}
                />
              </div>
            </div>
            <div
              style={{ flex: 1.5, padding: 0, margin: 0 }}
            >
              {renderRightMenu(this)}
            </div>
          </div>
        </div>
      </>
    );
  }
}

const WorkbookEditorContainer = withTracker(({ match }) => {
  let workbooksHandle;

  if (Meteor.userId()) {
    workbooksHandle = Meteor.subscribe('workbooks');
  } else {
    workbooksHandle = Meteor.subscribe('workbooks.public');
  }

  const loading = !workbooksHandle.ready();

  let workbook;
  let workbookExists;

  if (match.params._id === undefined) {
    workbookExists = true;
    const slides = [];
    workbook = { slides, title: null };
  } else {
    workbook = Workbooks.findOne(match.params._id);

    workbookExists = !loading && !!workbook;
  }

  return {

    workbookExists,
    workbook: workbookExists ? workbook : [],
  };
})(WorkbookEditor);

export default WorkbookEditorContainer;
