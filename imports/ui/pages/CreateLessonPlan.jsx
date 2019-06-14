/* eslint-disable react/no-danger */
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
import FaTrash from 'react-icons/lib/fa/trash';
import FaEdit from 'react-icons/lib/fa/edit';
import MdUndo from 'react-icons/lib/md/undo';
import MdRedo from 'react-icons/lib/md/redo';
import TextBoxes from '../components/TextBoxes';
import AddSim from '../components/AddSim';
import Lists from '../components/List';
import SimsList from '../components/SimsList';
import { LessonPlans } from '../../api/lessonplans';
import DrawingBoardCmp from '../components/DrawingBoardCmp';

/* This Component is intended for the development of a
    lessonplan by the teachers. Each lessonplan
    is composed of a sequence of slides. Each slide contains
    a note (the drawing on the canvas which is
    is of type string) and array of simulations.
    The changes need to be saved explicitly by clicking
    the save button for updating the database.
*/

export class CreateLessonPlan extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      /* Title holds the title of the lessonplan. CurSlide holds
        the current slide on which we are in.
        id holds the id of the current lessonplan. Initialzed is set
        to true once data is fetched from the database and is filled in the state.
        loginNotification becomes true when save button is pressed
        and the user is not logged in. Checked holds the interact checkbox value.
        RedirectToLogin is set to true if we want to redirect the user to the login page.
        Checked holds the interact checkbox value. RedirectToDashboard set to true if
        we want to redirect the user to the dashboard
    */

      title: true,
      curSlide: 0,
      slides: [],
      _id: '',
      initialized: false,
      loginNotification: false,
      redirectToLogin: false,
      interactEnabled: false,
      redirectToDashboard: false,
      forkedLessonPlanId: null,
      author: '',
      copied: false,
      scaleX: 1,
      description: [],
      showDescription: false,
      addDescription: false,
      saving: false,
    };

    /* PageCount holds the the value associated with the extra length of the canvas
        PushSlide is for creation of new slide, save to save the slides to the db,
        handleKeyDown for dealing with shortcuts (See the definitions below)
    */

    this.pageCount = 0;
    this.pushSlide.bind(this);
    this.save.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.changePageCount.bind(this);

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
    const { lessonplanExists, lessonplan } = nextProps;
    const { initialized, userId } = this.state;
    if (lessonplanExists === false) return;
    if (initialized === true) return;

    this.setState(
      {
        ...lessonplan,
        initialized: true,
      },
      () => {
        Meteor.call('getUsername', userId, (err, name) => {
          this.setState({
            author: name,
          });
        });

        const { slides, curSlide } = this.state;

        if (slides.length === 0) {
          this.pushSlide(slides);

          this.setSizeOfPage(0);
          this.db.reset();

          this.saveChanges(slides);
          this.interact();
        } else {
          this.pageCount = slides[curSlide].pageCount || 0;

          /* The size of the page is set first, then we completely reset the canvas
                And the notes are drawn back to the canvas
            */

          this.setSizeOfPage(this.pageCount);

          this.db.reset();
          this.db.setImg(slides[curSlide].note);

          this.saveChanges(slides);
          this.interact();
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

  handleWindowResize = () => {
    this.setState({
      scaleX:
        document.getElementsByClassName('twelve wide column')[0].offsetWidth
        / 1366,
    });
    this.handleScroll();
  };

  handleKeyDown = (e) => {
    /*
            This function handles the shortcut key functionalities.
         */

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
        this.db.props.onChange();
      }
    }

    if (e.keyCode === 46) {
      this.db.b.remove(...this.db.b.getActiveObjects());
      this.db.b.discardActiveObject().renderAll();
      this.db.props.onChange();
    }

    if (e.keyCode === 90 && e.ctrlKey) this.undo();

    if (e.keyCode === 89 && e.ctrlKey) this.redo();

    if (e.keyCode === 83 && e.ctrlKey) {
      e.preventDefault();
      this.save();
    }

    if (e.keyCode === 68 && e.ctrlKey) {
      e.preventDefault();
      this.interact();
    }
  };

  saveAfterReset = () => {
    const { slides, curSlide } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));
    _slides[curSlide].note = this.db.getImg();
    this.setState({
      slides: _slides,
    });
  };

  handleScroll = () => {
    if (Meteor.isTest) return;
    /**
     * When transform is used the fixed value of position of drawing-board-controls is disabled
     * So as we scroll, the top value is explicitly brought down by changing the top value to
     * the window.scrollTop
     */
    const { scaleX } = this.state;
    const scrollTop = $(window).scrollTop();
    $('.drawingBoardControls')[0].style.top = `${scrollTop / scaleX}px`;
  };

  setSizeOfPage = (pageCount) => {
    /*
            This function sets the size of the canvas. By default the size of the page is
            900px. The user can add extra poges. With each addition the size of the page
            increases by 300px.
            First the size of the container is incremented, then the canvas's size is
            incremented
        */

    $('.canvas-container')[0].style.height = `${900 + pageCount * 300}px`;
    $('.upper-canvas')[0].style.height = $('.canvas-container')[0].style.height;
    $('.lower-canvas')[0].style.height = $('.canvas-container')[0].style.height;
    $('.upper-canvas')[0].height = 900 + pageCount * 300;
    $('.lower-canvas')[0].height = 900 + pageCount * 300;
    this.db.b.setHeight($('.upper-canvas')[0].height);
  }

  onChange = () => {
    /*
            Whenever board:reset or board:StopDrawing event occurs, this function is called.
            Here we retrieve the current slide no. and note from the states. The notes are
            updated and stored back to the state.
        */
    const { slides } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));
    const { curSlide } = this.state;
    const note = this.db.getImg();
    _slides[curSlide].note = note;
    _slides[curSlide].pageCount = this.pageCount;
    this.saveChanges(_slides);
  }

  addNewSlide = () => {
    /* this.savethis.savethis.savethis.savethis.savethis.savethis.savethis.save
        Used for creating a new slide
    */

    let { curSlide } = this.state;
    const { slides } = this.state;
    this.pushSlide(slides);
    curSlide = slides.length - 1;
    this.setState(
      {
        curSlide,
      },
      () => {
        this.pageCount = 0;
        this.setSizeOfPage(0);
        this.db.reset();
      },
    );
  }

  setStateAfterRearranging = (slides, newIndex) => {
    this.setState(
      {
        slides,
      },
      () => {
        this.saveChanges(undefined, newIndex);
      },
    );
  }

  pushSlide = (slides) => {
    /* To create a new slide, first the structure of slide is defined and
           then pushed to the slides array.
        */

    const newSlide = {
      note: [],
      iframes: [],
      pageCount: 0,
      textboxes: [],
    };

    slides.push(newSlide);

    this.setState({
      slides,
    });
  }

  reset = () => {
    /* The current slide is made 0 and slides set to empty array.
           The first slide is initialized here. And the old notes are
           cleared.
        */

    this.setState(
      {
        curSlide: 0,
        slides: [],
      },
      () => {
        const { slides } = this.state;
        this.pushSlide(slides);
        this.setSizeOfPage(0);
        this.db.reset();
      },
    );
  }

  save = () => {
    /* This function is intended for saving the slides to the database.
            If not logged in, user is asked to login first.
        */

    if (!Meteor.userId()) {
      this.setState({ loginNotification: true });
      return;
    }

    if (this.addSim.state.isOpen) return;

    const { userId, title, slides } = this.state;

    if (userId !== Meteor.userId()) {
      const confirmation = confirm(
        'Are you sure you want to fork this lessonplan?',
      );

      if (!confirmation) return;

      Meteor.call('lessonplans.insert', title, (err, id) => {
        Meteor.call('lessonplans.update', id, slides);

        this.setState(
          {
            redirectToDashboard: true,
            forkedLessonPlanId: id,
          },
          () => {
            confirm('Forked succesfully');
          },
        );
      });
    } else {
      const { _id } = this.state;

      const lessonplan = LessonPlans.findOne({ _id });

      /* If the slides in the state has the same values as that of the slides
            in the database, we need not save, expect to deep include by chai checks this equality.
            If they are not same, an error is thrown. When we catch the error, we can see that the
            data are different and we initiate the save.
        */

      try {
        expect({ slides: lessonplan.slides }).to.deep.include({
          slides,
        });
      } catch (error) {
        if (error) {
          this.setState({
            saving: true,
          });

          Meteor.call('lessonplans.update', _id, slides, () => {
            alert('Saved successfully');
            this.setState({
              saving: false,
            });
          });
        }
      }
    }
  }

  pushToUndoStacks = (oldSlide) => {
    /**
     * oldSlide is the object that get pushed to the undoStack
     */

    if (this.shouldNotUndo) return;

    const { curSlide } = this.state;

    if (!this.undoStacks[curSlide]) {
      this.undoStacks[curSlide] = [];
    }

    try {
      expect(oldSlide).to.deep.include(
        this.undoStacks[curSlide][
          this.undoStacks[curSlide].length - 1
        ],
      );
    } catch (error) {
      if (error) {
        this.undoStacks[curSlide].push(oldSlide);
      }
    }
  };

  saveChanges = (_slides, _curSlide, shouldNotLoad, shouldNotPushToUndoStack) => {
    /* This function is used in multiple places to save the changes (not in the database, but
        in the react state).
        Depending upon the changes made, they are saved looking upon arguments given when the
        function was called.
    */

    const { slides, curSlide } = this.state;

    if (_slides === undefined) {
      const slide = slides[curSlide];

      if (this.undoStacks[curSlide]) {
        if (this.undoStacks[curSlide].length === 0) {
          if (!shouldNotPushToUndoStack) this.pushToUndoStacks(slide);
        }
      }

      this.setState(
        {
          curSlide: _curSlide,
        },
        () => {
          // eslint-disable-next-line no-shadow
          const { curSlide } = this.state;
          this.pageCount = slides[curSlide].pageCount || 0;
          this.setSizeOfPage(this.pageCount);

          this.db.reset();

          this.db.setImg(slides[curSlide].note);
          this.simsList.loadDataToSketches();
        },
      );
    } else if (_curSlide === undefined) {
      const slide = slides[curSlide];
      if (!shouldNotPushToUndoStack) this.pushToUndoStacks(slide);

      this.setState(
        {
          slides: _slides,
        },
        () => {
          /**
           * shouldNotLoad is true only when a sim is individually updated and saved
           * Here, we need not load data to all the sims
           * So if shouldNotLoad is true, we return without calling loadDatatoSketches
           */

          if (shouldNotLoad) return;

          this.simsList.loadDataToSketches();
        },
      );
    } else {
      const slide = slides[curSlide];

      if (!shouldNotPushToUndoStack) this.pushToUndoStacks(slide);

      this.setState(
        {
          slides: _slides,
          curSlide: _curSlide,
        },
        () => {
          // eslint-disable-next-line no-shadow
          const { curSlide, slides } = this.state;
          this.pageCount = slides[curSlide].pageCount || 0;
          this.setSizeOfPage(this.pageCount);

          this.db.reset();

          this.db.setImg(slides[curSlide].note);
          this.simsList.loadDataToSketches();
        },
      );
    }
  }

  deleteSlide = (index) => {
    /* This function decides what to do when the X button is pressed in the
           slide element. If there is only one element. it is not deleted,
           it is just reset. Otherwise, the slide is deleted and the current slide is set.
        */

    const { slides } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));

    if (_slides.length !== 1) {
      _slides.splice(index, 1);

      let { curSlide } = this.state;
      this.undoStacks.splice(index, 1);

      if (index === 0) {
        curSlide = 0;
      }
      if (curSlide === _slides.length) curSlide = _slides.length - 1;

      this.saveChanges(_slides, curSlide);
    } else {
      this.undoStacks = [];
      this.reset();
    }
  }

  deleteSim = (index) => {
    /* This function decides what to do when cross button in the simulation is pressed.
        The simulation is deleted from the iframes array of the
        current slide and the changes are saved.
    */
    const { slides } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));
    const { curSlide } = this.state;
    const { iframes } = _slides[curSlide];
    iframes.splice(index, 1);
    _slides[curSlide].iframes = iframes;
    this.saveChanges(_slides);
  }

  deleteTextBox = (index) => {
    const { slides } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));
    const { curSlide } = this.state;
    const { textboxes } = _slides[curSlide];
    textboxes.splice(index, 1);
    _slides[curSlide].textboxes = textboxes;
    this.saveChanges(_slides);
  };

  interact = () => {
    /*
    To interact with the simulation, interact should be enabled
    which disables the pointer events in the canvas,
    so that when we interact with the simulation, no drawings
    are made. Unchecking the interact, unsets the
    pointer events.
    */
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
  }

  checkCanvasSize = () => {
    /*
        This function ensures that the the size of the Canvas is not reduced to a value less
        than the bottom most point of the last sim/textbox

        initially maxHeight is set to the lowest possible value = -Infinity
        Then we iterate through each object i.e textboxes and sims

        The y coordinate of bottom of lowest element is found out

        If y > height of canvas after reduction, 1 is returned
    */

    let maxHeight = -Infinity;

    let j = $('textarea').length;
    let textarea;

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
    if (($('.canvas-cont').height() - 300) * scaleX < maxHeight) return 1;

    return 0;
  }

  undo = () => {
    /**
     * The function is triggered when undo button is pressed or shortcut ctrl+z is pressed
     * From the undoStacks, from the curSlide, slide object is popped and slide is restored
     * When this is done, redoStacks is pushed with current state
     */

    const { curSlide, slides } = this.state;

    const slide = this.undoStacks[curSlide].pop();

    if (!this.redoStacks[curSlide]) {
      this.redoStacks[curSlide] = [];
    }

    if (slide) {
      this.redoStacks[curSlide].push(
        slides[curSlide],
      );
      this.restoreStateBack(slide);
    }
  };

  redo = () => {
    /**
     * When undo is called, the current state is saved to redoStack
     */
    const { curSlide, slides } = this.state;

    const slide = this.redoStacks[curSlide].pop();

    if (slide) {
      this.undoStacks[curSlide].push(
        slides[curSlide],
      );
      this.restoreStateBack(slide);
    }
  };

  restoreStateBack = (slide) => {
    const { slides, curSlide } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));
    _slides[curSlide] = slide;

    this.setState(
      {
        slides: _slides,
      },
      () => {
        // eslint-disable-next-line no-shadow
        const { curSlide, slides } = this.state;
        this.pageCount = slides[curSlide].pageCount || 0;
        this.setSizeOfPage(this.pageCount);
        this.simsList.loadDataToSketches();
        /**
         * When reset is called, we need not push the slide to undostack
         */
        this.preventUndo = true;
        this.db.reset();
        this.preventUndo = false;
        this.db.setImg(slides[curSlide].note);

        /**
         * If note has empty string,
         * we explicitly clear the canvas
         */

        if (!slides[curSlide].note) {
          this.preventUndo = true;
          this.db.reset();
          this.preventUndo = false;
        }
      },
    );
  };

  headToRequestPage = () => {
    this.setState({ redirectToRequest: true });
  }

  changePageCount = (option) => {
    /*
            The function is used for increasing or decreasing the size of the page.
            Option will receive either 1 or -1, 1 means to increase the size, -1 means to decrease
            Theight attrubute of the canvas is obtained and 300 is added / subtracted to it
            The image is restored to the canvas
            The page count value is added to the slide
        */

    const temp = this.db.getImg();

    this.pageCount += option;
    $('.upper-canvas')[0].style.height = `${($('.upper-canvas')[0].height + option * 300).toString()}px`;
    $('.lower-canvas')[0].style.height = `${($('.lower-canvas')[0].height + option * 300).toString()}px`;
    $('.upper-canvas')[0].height += option * 300;
    $('.lower-canvas')[0].height += option * 300;
    $('.canvas-container')[0].style.height = $('.lower-canvas')[0].style.height;
    this.db.b.setHeight($('.upper-canvas')[0].height);

    /**
     * When reset is called here, we need not push to undo stack
     * preventUndo variable is used for preventing object being added to undoStacks
     */

    this.preventUndo = true;

    this.db.reset();

    this.preventUndo = false;

    this.db.setImg(temp);
    const { slides, curSlide } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));
    _slides[curSlide].pageCount = this.pageCount;
    this.saveChanges(_slides);
  }

  addTextBox = () => {
    const { curSlide, slides } = this.state;
    const _slides = Object.values($.extend(true, {}, slides));

    if (!_slides[curSlide].textboxes) {
      _slides[curSlide].textboxes = [];
    }

    const newTextBox = {
      value: 'new text box',
    };

    _slides[curSlide].textboxes.push(newTextBox);

    this.saveChanges(_slides);
  };

  setCopiedState = (set) => {
    if (set) this.setState({ copied: true });
    else this.setState({ copied: false });
  }

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

    Meteor.call('lessonplans.description', _id, description, () => {
      alert('Description addedd successfully');
    });
  };

  checkDescExist = () => {
    const { _id } = this.state;
    const a = LessonPlans.find({
      _id,
      description: { $exists: true },
    }).fetch();
    if (a.length !== 0) return true;

    Meteor.call('lessonplans.addDescriptionField', _id);
  };

  checkDescription = () => {
    const { _id } = this.state;
    const res = LessonPlans.find({ _id }).fetch();
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

  render() {
    const {
      showDescription,
      addDescription,
      redirectToLogin,
      redirectToDashboard,
      initialized,
      loginNotification,
      scaleX,
      saving,
      slides,
      curSlide,
      interactEnabled,
      _id,
      userId,
      title,
      copied,
      description,
    } = this.state;

    if (redirectToLogin) {
      return <Redirect to="/login" />;
    }

    if (redirectToDashboard) {
      return <Redirect to="/dashboard/lessonplans" />;
    }

    return (
      <Segment style={{ padding: 0, margin: 0 }}>
        <Dimmer active={!initialized}>
          <Loader />
        </Dimmer>

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

        <Grid
          style={{
            height:
              `${this.calcHeightOfCanvasContainer() * scaleX}px`,
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
                overflow: 'auto',
              }}
              width={2}
            >
              {saving ? <p>Saving...</p> : null}
              <Button
                style={{ marginTop: '0.8rem' }}
                onClick={this.addNewSlide}
              >
                Create Slide
              </Button>
              <h1>{curSlide + 1}</h1>
              <Lists
                slides={slides}
                curSlide={curSlide}
                saveChanges={this.saveChanges}
                delete={this.deleteSlide}
                setStateAfterRearranging={this.setStateAfterRearranging}
                from="createLessonplan"
                isPreview={false}
              />
            </Grid.Column>
            <Grid.Column
              style={{
                margin: '0 auto',
                padding: 0,
                overflowX: 'hidden',
                overflowY: 'hidden',
                height:
                  `${this.calcHeightOfCanvasContainer() * scaleX}px`,
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
                  saveChanges={this.saveChanges}
                  deleteTextBox={this.deleteTextBox}
                  isPreview={false}
                  setCopiedState={this.setCopiedState}
                />

                <SimsList
                  slides={slides}
                  curSlide={curSlide}
                  saveChanges={this.saveChanges}
                  deleteSim={this.deleteSim}
                  isPreview={false}
                  setCopiedState={this.setCopiedState}
                  isRndRequired
                  undo={this.undo}
                  redo={this.redo}
                  ref={(e) => { this.simsList = e; }}
                  save={this.save}
                  interact={this.interact}
                />

                <DrawingBoardCmp
                  interactEnabled={interactEnabled}
                  interact={this.interact}
                  toolbarVisible
                  ref={(e) => { this.drawingBoard = e; }}
                  onChange={this.onChange}
                  saveAfterReset={this.saveAfterReset}
                />
              </div>
            </Grid.Column>

            <Grid.Column width={2} style={{ position: 'fixed', right: 0 }}>
              <AddSim
                ref={(e) => { this.addSim = e; }}
                curSlide={curSlide}
                slides={slides}
                saveChanges={this.saveChanges}
              />

              <Menu color="blue" icon vertical>
                <Menu.Item>
                  <Button
                    toggle
                    active={!interactEnabled}
                    onClick={this.interact}
                  >
                    {interactEnabled ? 'Draw' : 'Interact'}
                  </Button>
                </Menu.Item>

                <Menu.Item>
                  <Button
                    onClick={() => {
                      this.addSim.addSim();
                    }}
                    color="black"
                  >
                    Add simulation
                  </Button>
                </Menu.Item>

                {Meteor.userId() ? (
                  <Menu.Item>
                    {' '}
                    <Button
                      color="blue"
                      onClick={() => {
                        const lessonplan = LessonPlans.findOne({
                          _id,
                        });

                        try {
                          expect({ slides: lessonplan.slides }).to.deep.include(
                            { slides },
                          );
                        } catch (error) {
                          if (error) {
                            const confirmation = confirm(
                              'Are you sure you want to leave. Any unsaved changes will be lost!',
                            );

                            if (!confirmation) return;
                          } else return;
                        }

                        this.setState({
                          redirectToDashboard: true,
                        });
                      }}
                    >
                      Dashboard
                    </Button>
                  </Menu.Item>
                ) : null}

                {!!Meteor.userId() && userId === Meteor.userId() ? (
                  <Link to={`/request/${_id}`}>
                    <Menu.Item link>Request for new sim</Menu.Item>
                  </Link>
                ) : null}
                <Menu.Item
                  onClick={() => {
                    const confirmation = confirm(
                      'Are you sure you want to reset all?',
                    );
                    if (confirmation === true) this.reset();
                  }}
                >
                  Reset lessonplan
                </Menu.Item>

                <Menu.Item>
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
                </Menu.Item>

                <Menu.Item
                  onClick={() => {
                    this.save();
                  }}
                >
                  {Meteor.userId() === userId || !Meteor.userId()
                    ? 'Save'
                    : 'Fork and Save'}
                </Menu.Item>

                <Menu.Item
                  // eslint-disable-next-line react/no-string-refs
                  ref="increaseCanvasButton"
                  onClick={() => {
                    this.changePageCount(1);
                  }}
                >
                  Increase Canvas size
                </Menu.Item>

                <Menu.Item
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
                  onClick={() => {
                    this.addTextBox();
                  }}
                >
                  Add textbox
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
                              <input ref={(e) => { this.subject = e; }} required />
                            </Form.Field>
                            <Form.Field>
                              <label>Topic</label>
                              <input
                                ref={(e) => { this.topic = e; }}
                                placeholder="-"
                              />
                            </Form.Field>
                            <Form.Field>
                              <label>Learning Objective(s)</label>
                              <textArea
                                rows={1}
                                ref={(e) => { this.learningObjectives = e; }}
                                placeholder="-"
                              />
                            </Form.Field>
                            <Form.Field>
                              <label>In-Class Activities</label>
                              <textArea
                                rows={1}
                                ref={(e) => { this.inClassActivities = e; }}
                                placeholder="-"
                              />
                            </Form.Field>
                            <Form.Field>
                              <label>References/Resources</label>
                              <textArea
                                rows={1}
                                ref={(e) => { this.resources = e; }}
                                placeholder="-"
                              />
                            </Form.Field>
                            <Form.Field>
                              <label>Assessments</label>
                              <input
                                ref={(e) => { this.assessments = e; }}
                                placeholder="-"
                              />
                            </Form.Field>
                            <Form.Field>
                              <label>Standards</label>
                              <input
                                ref={(e) => { this.standards = e; }}
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
                              const res = LessonPlans.find({
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
                          {!!Meteor.userId()
                        && userId === Meteor.userId() ? (
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
                                      ref={(e) => { this.subject = e; }}
                                      placeholder={
                                        description.subject
                                      }
                                    />
                                  </Form.Field>
                                  <Form.Field>
                                    <label>Topic</label>
                                    <input
                                      ref={(e) => { this.topic = e; }}
                                      placeholder={description.topic}
                                    />
                                  </Form.Field>
                                  <Form.Field>
                                    <label>Learning Objective(s)</label>
                                    <textArea
                                      rows={1}
                                      ref={(e) => { this.learningObjectives = e; }}
                                      placeholder={
                                        description
                                          .learningObjectives
                                      }
                                    />
                                  </Form.Field>
                                  <Form.Field>
                                    <label>In-Class Activities</label>
                                    <textArea
                                      rows={1}
                                      ref={(e) => { this.inClassActivities = e; }}
                                      placeholder={
                                        description.inClassActivities
                                      }
                                    />
                                  </Form.Field>
                                  <Form.Field>
                                    <label>References/Resources</label>
                                    <textArea
                                      rows={1}
                                      ref={(e) => { this.resources = e; }}
                                      placeholder={
                                        description.resources
                                      }
                                    />
                                  </Form.Field>
                                  <Form.Field>
                                    <label>Assessments</label>
                                    <input
                                      ref={(e) => { this.assessments = e; }}
                                      placeholder={
                                        description.assessments
                                      }
                                    />
                                  </Form.Field>
                                  <Form.Field>
                                    <label>Standards</label>
                                    <input
                                      ref={(e) => { this.standards = e; }}
                                      placeholder={
                                        description.standards
                                      }
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
                          {!!Meteor.userId()
                        && userId === Meteor.userId() ? (
                          <FaTrash
                            style={{ cursor: 'pointer', marginLeft: '15px' }}
                            size={17}
                            color="black"
                            onClick={() => {
                              const confirmation = confirm(
                                'Are you sure you want to perform this deletion?',
                              );

                              if (!confirmation) return;

                              Meteor.call(
                                'lessonplans.removeDescription',
                                _id,
                                () => {
                                  this.setState({ description: [] });
                                },
                              );
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

                            const _slides = Object.values(
                              $.extend(true, {}, slides),
                            );

                            if (object.type === 'sim') {
                              _slides[curSlide].iframes.push(
                                object.copiedObject,
                              );
                            } else if (object.type === 'text') {
                              _slides[curSlide].textboxes.push(
                                object.copiedObject,
                              );
                            }

                            this.saveChanges(_slides);
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
              </Menu>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Modal size="tiny" open={!title}>
          <Modal.Header>Enter the title for the lessonplan</Modal.Header>

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
                  <input ref={(e) => { this.title = e; }} />
                </Form.Field>
                <Form.Field>
                  <Button type="submit">Submit</Button>
                </Form.Field>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </Segment>
    );
  }
}

const CreatelessonPlanContainer = withTracker(({ match }) => {
  let lessonplansHandle;

  /*
        If the user is logged in, we fetch his lessonplans.
        Otherwise, we fetch every public lessonplans.
    */

  if (Meteor.userId()) {
    lessonplansHandle = Meteor.subscribe('lessonplans');
  } else {
    lessonplansHandle = Meteor.subscribe('lessonplans.public');
  }

  /*
    loading becomes false when we get the lessonplans collection.
  */

  const loading = !lessonplansHandle.ready();

  let lessonplan; let
    lessonplanExists;

  if (match.params._id === undefined) {
    /*
      If lessonplan creator is taken by creating a new lessonplan,
      the id will be undefined, so an empty list of slides is created with title null.
    */

    lessonplanExists = true;
    const slides = [];
    lessonplan = { slides, title: null };
  } else {
    /*
      If id is not null, we are trying to open an existing lessonplans,
      so it is fetched from the database.
      If the lessonplan exists for the id provided, loading is set to false.
    */

    lessonplan = LessonPlans.findOne(match.params._id);

    lessonplanExists = !loading && !!lessonplan;
  }

  return {
    /*
      LessonplanExists is returned for determining if the loading screen display.
      If lessonplan exists, it is returned, otherwise an empty array is returned.
      Go to the componentWillReceiveProps to see what we do with the returned lessonplan.
    */

    lessonplanExists,
    lessonplan: lessonplanExists ? lessonplan : [],
  };
})(CreateLessonPlan);

export default CreatelessonPlanContainer;
