/* eslint-disable react/no-danger */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-control-regex */
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Menu,
  Button,
  Dimmer,
  Loader,
  Segment,
  Modal,
  Form,
  Grid,
  List,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import DOMPurify from 'dompurify';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { MdUndo, MdRedo } from 'react-icons/md';
import TextBoxes from '../components/workbook/TextBoxes';
import MCQs from '../components/workbook/MCQs';
import ShortResponses from '../components/workbook/ShortResponses';
import AddSim from '../components/AddSim';
import SlidesList from '../components/workbook/List';
import SimsList from '../components/SimsList';
import { Workbooks } from '../../api/workbooks';
import DrawingBoardCmp from '../components/workbook/DrawingBoardCmp';

/**
 * renders the page in which teachers create, edit, save and present workbooks
 */
export class CreateWorkbook extends React.Component {
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
      addDescription: false,
      saving: false,
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
  }

  componentWillReceiveProps(nextProps) {
    // eslint-disable-next-line react/prop-types
    const { workbookExists, workbook } = nextProps;
    const { initialized } = this.state;

    if (workbookExists === false) return;
    if (initialized === true) return;

    this.setState(
      {
        ...workbook,
        initialized: true,
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
  }

  /**
   * Calculates and set scaleX, the factor by which the canvas container should be
   * scaled so that it fits the window
   */
  handleWindowResize = () => {
    this.setState({
      scaleX:
        document.getElementsByClassName('twelve wide column')[0].offsetWidth
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
    const scrollTop = $(window).scrollTop();
    // While finding the top offset, we need to take into account of the scale factor also
    $('.drawingBoardControls')[0].style.top = `${scrollTop / scaleX}px`;
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

  setStateAfterRearranging = (slides, newIndex) => {
    this.setState(
      {
        slides,
      },
      () => {
        this.changeSlide(newIndex);
      },
    );
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

  setCopiedState = (set) => {
    if (set) this.setState({ copied: true });
    else this.setState({ copied: false });
  };

  addDescription = () => {
    this.setState({ showDescription: false });
    this.setState({ addDescription: false });

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
      learningObjectives = DOMPurify.sanitize(
        this.learningObjectives.value.replace(
          new RegExp('\r?\n', 'g'),
          '<br />',
        ),
      );
    }

    if (this.inClassActivities.value === '') {
      inClassActivities = this.inClassActivities.placeholder;
    } else {
      inClassActivities = DOMPurify.sanitize(
        this.inClassActivities.value.replace(new RegExp('\r?\n', 'g'), '<br />'),
      );
    }

    if (this.resources.value === '') {
      resources = this.resources.placeholder;
    } else {
      resources = DOMPurify.sanitize(
        this.resources.value.replace(new RegExp('\r?\n', 'g'), '<br />'),
      );
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

  checkDescription = () => {
    const { _id } = this.state;
    const res = Workbooks.find({ _id }).fetch();
    const desc = res[0].description;
    return Object.keys(desc).length === 0 && desc.constructor === Object;
  };

  renderDescription = () => {
    const { description } = this.state;
    if (
      Object.keys(description).length === 0
      && description.constructor === Object
    ) {
      return <p>No description to show</p>;
    }
    return (
      <List divided relaxed>
        <List.Item>
          <List.Header>Subject</List.Header>
          {description.subject}
        </List.Item>
        <List.Item>
          <List.Header>Topic</List.Header>
          {description.topic}
        </List.Item>
        <List.Item>
          <List.Header>Learning Objectives</List.Header>
          <div
            dangerouslySetInnerHTML={{
              __html: description.learningObjectives,
            }}
          />
        </List.Item>
        <List.Item>
          <List.Header>In-Class Activites</List.Header>
          <div
            dangerouslySetInnerHTML={{
              __html: description.inClassActivities,
            }}
          />
        </List.Item>
        <List.Item>
          <List.Header>Resources</List.Header>
          <div
            dangerouslySetInnerHTML={{
              __html: description.resources,
            }}
          />
        </List.Item>
        <List.Item>
          <List.Header>Assessments</List.Header>
          {description.assessments}
        </List.Item>
        <List.Item>
          <List.Header>Standards</List.Header>
          {description.standards}
        </List.Item>
      </List>
    );
  };

  calcHeightOfCanvasContainer = () => {
    const { slides, curSlide } = this.state;
    if (slides.length > 0) {
      return 900 + slides[curSlide].pageCount * 300;
    }
    return 900;
  };

  renderRightMenu = () => {
    const {
      showDescription,
      addDescription,
      copied,
      description,
      curSlide,
      slides,
      interactEnabled,
      userId,
      _id,
    } = this.state;

    return (
      <>
        <AddSim
          ref={(e) => {
            this.addSim = e;
          }}
          curSlide={curSlide}
          slides={slides}
          updateSlides={this.updateSlides}
        />

        <Menu color="blue" icon vertical className="lpright">
          <Menu.Item>
            <Button
              className="lprightbutton"
              toggle
              active={!interactEnabled}
              onClick={this.toggleInteract}
            >
              {interactEnabled ? 'Draw' : 'Interact'}
            </Button>
          </Menu.Item>

          <Menu.Item>
            <Button
              className="lprightbutton"
              onClick={() => {
                this.addSim.addSim();
              }}
              color="black"
            >
              Add simulation
            </Button>
          </Menu.Item>

          {!!Meteor.userId() && userId === Meteor.userId() ? (
            <Link
              to={{
                pathname: `/request/${_id}`,
                state: { from: 'createlessonplan' },
              }}
            >
              <Menu.Item link className="lprightbutton">
                Discussion forum
              </Menu.Item>
            </Link>
          ) : null}
          <Menu.Item
            className="lprightbutton"
            onClick={() => {
              const confirmation = confirm(
                'Are you sure you want to reset all?',
              );
              if (confirmation === true) this.reset();
            }}
          >
            Reset workbook
          </Menu.Item>

          <Menu.Item className="lprightbutton">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <Button
                  color="teal"
                  onClick={() => {
                    this.undo();
                  }}
                  attached="left"
                >
                  <MdUndo />
                </Button>
                <Button
                  color="teal"
                  onClick={() => {
                    this.redo();
                  }}
                  attached="right"
                >
                  <MdRedo />
                </Button>
              </div>
              <p style={{ marginTop: '1rem' }}>Undo/redo</p>
            </div>
          </Menu.Item>

          <Menu.Item
            className="lprightbutton"
            onClick={() => {
              this.saveToDatabase();
            }}
          >
            {Meteor.userId() === userId || !Meteor.userId()
              ? 'Save'
              : 'Fork and Save'}
          </Menu.Item>

          <Menu.Item
            className="lprightbutton"
            // eslint-disable-next-line react/no-string-refs
            ref="increaseCanvasButton"
            onClick={() => {
              this.changePageCount(1);
            }}
          >
            Increase Canvas size
          </Menu.Item>

          <Menu.Item
            className="lprightbutton"
            onClick={() => {
              if (this.pageCount === 0 || this.checkCanvasSize()) {
                alert('Canvas size cannot be decreased further!');
                return;
              }

              this.changePageCount(-1);
            }}
          >
            Decrease Canvas size
          </Menu.Item>

          {!Meteor.userId() ? (
            <Menu.Item
              className="lprightbutton"
              onClick={() => {
                const confirmation = confirm(
                  'You will be redirected to login page. Changes will be saved for you.',
                );
                if (!confirmation) return;

                Session.set('stateToSave', this.state);

                this.setState({ redirectToLogin: true });
              }}
            >
              Login
            </Menu.Item>
          ) : null}
          {!Meteor.userId() ? (
            <Link to="/explore">
              <Menu.Item link>Back</Menu.Item>
            </Link>
          ) : null}

          <Menu.Item
            className="lprightbutton"
            onClick={() => {
              this.addTextBox();
            }}
          >
            Add textbox
          </Menu.Item>

          <Menu.Item
            className="lprightbutton"
            onClick={() => {
              this.addQuestion();
            }}
          >
            Add question
          </Menu.Item>
          {this.checkDescExist() ? (
            !!Meteor.userId()
            && userId === Meteor.userId()
            && this.checkDescription() ? (
              <Modal
                size="small"
                onClose={() => {
                  this.setState({ addDescription: false });
                }}
                open={addDescription}
                trigger={(
                  <Menu.Item
                    className="lprightbutton"
                    onClick={() => {
                      this.setState({ addDescription: true });
                    }}
                  >
                    Add description
                  </Menu.Item>
)}
              >
                <Modal.Header>
                  Lesson Description
                  <Button
                    className="close-button"
                    onClick={() => {
                      this.setState({ addDescription: false });
                    }}
                  >
                    X
                  </Button>
                </Modal.Header>

                <Modal.Content>
                  <Modal.Description>
                    <Form onSubmit={this.addDescription}>
                      <Form.Field required>
                        <label>Subject</label>
                        <input
                          ref={(e) => {
                            this.subject = e;
                          }}
                          required
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>Topic</label>
                        <input
                          ref={(e) => {
                            this.topic = e;
                          }}
                          placeholder="-"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>Learning Objective(s)</label>
                        <textArea
                          rows={1}
                          ref={(e) => {
                            this.learningObjectives = e;
                          }}
                          placeholder="-"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>In-Class Activities</label>
                        <textArea
                          rows={1}
                          ref={(e) => {
                            this.inClassActivities = e;
                          }}
                          placeholder="-"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>References/Resources</label>
                        <textArea
                          rows={1}
                          ref={(e) => {
                            this.resources = e;
                          }}
                          placeholder="-"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>Assessments</label>
                        <input
                          ref={(e) => {
                            this.assessments = e;
                          }}
                          placeholder="-"
                        />
                      </Form.Field>
                      <Form.Field>
                        <label>Standards</label>
                        <input
                          ref={(e) => {
                            this.standards = e;
                          }}
                          placeholder="-"
                        />
                      </Form.Field>
                      <Form.Field>
                        <Button type="submit">Submit</Button>
                      </Form.Field>
                    </Form>
                  </Modal.Description>
                </Modal.Content>
              </Modal>
              ) : (
                <Modal
                  size="small"
                  onClose={() => {
                    this.setState({ showDescription: false });
                  }}
                  open={showDescription}
                  trigger={(
                    <Menu.Item
                      onClick={() => {
                        this.setState({ showDescription: true });
                        const res = Workbooks.find({
                          _id,
                        }).fetch();
                        this.setState({ description: res[0].description });
                      }}
                    >
                    View description
                    </Menu.Item>
)}
                >
                  <Modal.Header>
                  Lesson Description
                    <Button
                      className="close-button"
                      onClick={() => {
                        this.setState({ showDescription: false });
                      }}
                    >
                    X
                    </Button>
                    {!!Meteor.userId() && userId === Meteor.userId() ? (
                      <Modal
                        size="small"
                        onClose={() => {
                          this.setState({ addDescription: false });
                        }}
                        open={addDescription}
                        trigger={(
                          <FaEdit
                            style={{
                              cursor: 'pointer',
                              marginLeft: '15px',
                            }}
                            size={17}
                            color="black"
                            onClick={() => {
                              this.setState({ addDescription: true });
                            }}
                          />
)}
                      >
                        <Modal.Header>
                        Lesson Description
                          <Button
                            className="close-button"
                            onClick={() => {
                              this.setState({ addDescription: false });
                            }}
                          >
                          X
                          </Button>
                        </Modal.Header>

                        <Modal.Content>
                          <Modal.Description>
                            <Form onSubmit={this.addDescription}>
                              <Form.Field>
                                <label>Subject</label>
                                <input
                                  ref={(e) => {
                                    this.subject = e;
                                  }}
                                  placeholder={description.subject}
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>Topic</label>
                                <input
                                  ref={(e) => {
                                    this.topic = e;
                                  }}
                                  placeholder={description.topic}
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>Learning Objective(s)</label>
                                <textArea
                                  rows={1}
                                  ref={(e) => {
                                    this.learningObjectives = e;
                                  }}
                                  placeholder={description.learningObjectives}
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>In-Class Activities</label>
                                <textArea
                                  rows={1}
                                  ref={(e) => {
                                    this.inClassActivities = e;
                                  }}
                                  placeholder={description.inClassActivities}
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>References/Resources</label>
                                <textArea
                                  rows={1}
                                  ref={(e) => {
                                    this.resources = e;
                                  }}
                                  placeholder={description.resources}
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>Assessments</label>
                                <input
                                  ref={(e) => {
                                    this.assessments = e;
                                  }}
                                  placeholder={description.assessments}
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>Standards</label>
                                <input
                                  ref={(e) => {
                                    this.standards = e;
                                  }}
                                  placeholder={description.standards}
                                />
                              </Form.Field>
                              <Form.Field>
                                <Button type="submit">Update</Button>
                              </Form.Field>
                            </Form>
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                    ) : null}
                    {!!Meteor.userId() && userId === Meteor.userId() ? (
                      <FaTrash
                        style={{ cursor: 'pointer', marginLeft: '15px' }}
                        size={17}
                        color="black"
                        onClick={() => {
                          const confirmation = confirm(
                            'Are you sure you want to perform this deletion?',
                          );

                          if (!confirmation) return;

                          Meteor.call('workbooks.removeDescription', _id, () => {
                            this.setState({ description: [] });
                          });
                        }}
                      />
                    ) : null}
                  </Modal.Header>

                  <Modal.Content>
                    <Modal.Description>
                      {this.renderDescription()}
                    </Modal.Description>
                  </Modal.Content>
                </Modal>
              )
          ) : null}

          <a
            target="_blank"
            href="https://github.com/JithinKS97/dynamic-learning"
          >
            <Menu.Item link>Contribute</Menu.Item>
          </a>

          {copied ? (
            <Menu.Item>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                  onClick={() => {
                    if (Session.get('copiedObject')) {
                      const object = Session.get('copiedObject');

                      const clonedSlides = Object.values(
                        $.extend(true, {}, slides),
                      );

                      if (object.type === 'sim') {
                        clonedSlides[curSlide].iframes.push(
                          object.copiedObject,
                        );
                      } else if (object.type === 'text') {
                        clonedSlides[curSlide].textboxes.push(
                          object.copiedObject,
                        );
                      }

                      this.updateSlides(clonedSlides);
                    }
                  }}
                  color="blue"
                >
                  Paste
                </Button>
                <Button
                  onClick={() => {
                    this.setCopiedState(false);
                    Session.set('copiedObject', null);
                  }}
                  color="red"
                >
                  X
                </Button>
              </div>
            </Menu.Item>
          ) : null}
          <Menu.Item>
            <Button
              onClick={() => {
                Meteor.call('workbook.submitAnswers');
              }}
            >
              Submit answers
            </Button>
          </Menu.Item>
        </Menu>
      </>
    );
  };

  renderLeftMenuHeader = () => {
    const {
      saving,
      slides,
      curSlide,
      _id,
    } = this.state;

    return (
      <div className="workbook-left-menu-header">
        {saving ? <p>Saving...</p> : null}
        {Meteor.userId() ? (
          <Button
            className="lprightbutton"
            color="blue"
            onClick={() => {
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
            }}
          >
            Dashboard
          </Button>
        ) : null}
        <Button
          className="createslide"
          style={{ marginTop: '0.8rem' }}
          onClick={this.addNewSlide}
        >
          Create Slide
        </Button>
        <h1 className="slidecounter">{curSlide + 1}</h1>
      </div>
    );
  }

  renderLoginNotificationModal = () => {
    const {

      loginNotification,
    } = this.state;

    return (
      <Modal size="tiny" open={loginNotification}>
        <Modal.Header>
            You need to login to save changes
          <Button
            style={{ float: 'right' }}
            onClick={() => {
              this.setState({ loginNotification: false });
            }}
          >
              X
          </Button>
        </Modal.Header>
        <Modal.Content>
          <Modal.Description style={{ textAlign: 'center' }}>
            <Button
              onClick={() => {
                Session.set('stateToSave', this.state);

                this.setState({ redirectToLogin: true });
              }}
              style={{ marginTop: '1.6rem' }}
            >
                Login
            </Button>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }

  renderWorkBookTitleModal = () => {
    const {
      title,
    } = this.state;

    return (
      <Modal size="tiny" open={!title}>
        <Modal.Header>Enter the title for the Workbook</Modal.Header>

        <Modal.Content>
          <Modal.Description>
            <Form
              onSubmit={() => {
                if (!this.title.value) return;

                this.setState({
                  title: this.title.value,
                });
              }}
            >
              <Form.Field>
                <label>Title</label>
                <input
                  ref={(e) => {
                    this.title = e;
                  }}
                />
              </Form.Field>
              <Form.Field>
                <Button type="submit">Submit</Button>
              </Form.Field>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }

  renderResponseModal = () => (
    <Modal
      size="tiny"
      // eslint-disable-next-line react/destructuring-assignment
      open={this.state.question}
      onClose={() => this.setState({ question: false })}
    >
      <Modal.Header>
          Choose a question type.
        <Button
          className="close-button"
          onClick={() => this.setState({ question: false })}
        >
            &times;
        </Button>
      </Modal.Header>

      <Modal.Content>
        <Modal.Description>
          <Button onClick={() => this.addMCQ()}> Multiple Choice </Button>
          <Button onClick={() => this.addShortResponse()}>
            {' '}
              Short Response
            {' '}
          </Button>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  )

  render() {
    const {
      redirectToLogin,
      redirectToDashboard,
      initialized,
      scaleX,
      slides,
      curSlide,
      interactEnabled,
      userId,
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
        {this.renderLoginNotificationModal()}
        {this.renderWorkBookTitleModal()}
        {this.renderResponseModal()}
        <Segment style={{ padding: 0, margin: 0 }}>
          <Dimmer active={!initialized}>
            <Loader />
          </Dimmer>
          <Grid
            style={{
              height: `${this.calcHeightOfCanvasContainer() * scaleX}px`,
              padding: 0,
              margin: 0,
            }}
            columns={3}
            divided
          >
            <Grid.Row style={{ overflow: 'hidden' }}>
              <Grid.Column
                style={{
                  position: 'fixed',
                  textAlign: 'center',
                }}
                width={2}
              >
                {this.renderLeftMenuHeader()}
                <div
                  style={{
                    height: `${this.calcHeightOfCanvasContainer() * scaleX - $('.workbook-left-menu-header').height() - 20}px`,
                    overflowY: 'auto',
                  }}
                >
                  <SlidesList
                    slides={slides}
                    curSlide={curSlide}
                    deleteSlide={this.deleteSlide}
                    setStateAfterRearranging={this.setStateAfterRearranging}
                    from="createWorkbook"
                    isPreview={false}
                    changeSlide={this.changeSlide}
                  />
                </div>
              </Grid.Column>
              <Grid.Column
                style={{
                  margin: '0 auto',
                  padding: 0,
                  overflowX: 'hidden',
                  overflowY: 'hidden',
                  height: `${this.calcHeightOfCanvasContainer() * scaleX}px`,
                }}
                width={12}
              >
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
                    toolbarVisible
                    ref={(e) => {
                      this.drawingBoard = e;
                    }}
                    onChange={this.onChange}
                    saveAfterReset={this.saveAfterReset}
                  />
                </div>
              </Grid.Column>

              <Grid.Column
                width={2}
                style={{ position: 'fixed', right: 0 }}
              >
                {this.renderRightMenu()}
              </Grid.Column>

            </Grid.Row>
          </Grid>
        </Segment>
      </>
    );
  }
}

const CreateWorkbookContainer = withTracker(({ match }) => {
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
})(CreateWorkbook);

export default CreateWorkbookContainer;
