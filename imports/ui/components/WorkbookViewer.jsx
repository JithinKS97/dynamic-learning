/* eslint-disable */
import React from "react";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { withTracker } from "meteor/react-meteor-data";
import {
  Button,
  Dimmer,
  Loader,
  Segment,
  Modal,
  Form,
  Grid,
  List
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { expect } from "chai";
import DOMPurify from "dompurify";
import TextBoxes from "../components/TextBoxes";
import MCQs from "../components/MCQs";
import ShortResponses from "../components/ShortResponses";
import SlidesList from "../components/ListWithoutDelete";
import SimsList from "../components/SimsList";
import { Workbooks } from "../../api/workbooks";
import DrawingBoardCmp from "../components/DrawingBoardCmp";

export class WorkbookViewer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      title: true,
      curSlide: 0,
      slides: [],
      _id: "",
      initialized: false,
      loginNotification: false,
      redirectToLogin: false,
      interactEnabled: false,
      redirectToDashboard: false,
      forkedWorkbookId: null,
      author: "",
      copied: false,
      scaleX: 1,
      description: [],
      showDescription: false,
      addDescription: false,
      saving: false
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

    window.addEventListener("keydown", this.handleKeyDown, false);
    this.handleWindowResize();
    $(window).scroll(this.handleScroll);
  }

  componentWillReceiveProps(nextProps) {

    const { workbookExists, workbook } = nextProps;
    const { initialized } = this.state;
    if (workbookExists === false) return;
    if (initialized === true) return;

    this.setState(
      {
        ...workbook,
        initialized: true
      },
      () => {
        const { slides } = this.state;

        this.interact();

        if (slides.length === 0) {
          this.addNewSlide();
        } else {
          this.changeSlide(0);
        }
      }
    );
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown, false);
    window.removeEventListener("scroll", this.handleScroll, false);
    window.removeEventListener("resize", this.handleWindowResize, false);
    window.removeEventListener("keydown", this.handleKeyDown, false);
  }

  handleWindowResize = () => {
    this.setState({
      scaleX:
        document.getElementsByClassName("fourteen wide column")[0].offsetWidth /
        1366
    });
    this.handleScroll();
    this.forceUpdate();
  };


  handleKeyDown = e => {
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
      this.interact();
    }
  };


  handleScroll = () => {
    if (Meteor.isTest) return;
    const { scaleX } = this.state;
    const scrollTop = $(window).scrollTop();
    $(".drawingBoardControls")[0].style.top = `${scrollTop / scaleX}px`;
  };

  setSizeOfPage = pageCount => {

    $(".canvas-container")[0].style.height = `${900 + pageCount * 300}px`;
    $(".upper-canvas")[0].style.height = $(".canvas-container")[0].style.height;
    $(".lower-canvas")[0].style.height = $(".canvas-container")[0].style.height;
    $(".upper-canvas")[0].height = 900 + pageCount * 300;
    $(".lower-canvas")[0].height = 900 + pageCount * 300;
    this.db.b.setHeight($(".upper-canvas")[0].height);
  };

  onChange = () => {

    const { slides } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));
    const { curSlide } = this.state;
    const note = this.db.getImg();
    updatedSlides[curSlide].note = note;
    updatedSlides[curSlide].pageCount = this.pageCount;
    this.updateSlides(updatedSlides);
  };

  addNewSlide = () => {
    let { curSlide } = this.state;
    const { slides } = this.state;

    this.pushSlide();
    curSlide = slides.length - 1;

    this.changeSlide(curSlide);
  };

  setStateAfterRearranging = (slides, newIndex) => {
    this.setState(
      {
        slides
      },
      () => {
        this.changeSlide(newIndex);
      }
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
      shortresponse: []
    };

    slides.push(newSlide);

    this.updateSlides(slides);
  };

  reset = () => {

    this.setState(
      {
        curSlide: 0,
        slides: []
      },
      () => {
        this.addNewSlide();
        this.setSizeOfPage(0);
        this.db.reset();
      }
    );
  };

  pushToUndoStacks = oldSlide => {

    if (this.shouldNotUndo) return;

    const { curSlide } = this.state;

    this.undoStacks[curSlide] = this.undoStacks[curSlide] || [];

    try {
      expect(oldSlide).to.deep.include(
        this.undoStacks[curSlide][this.undoStacks[curSlide].length - 1]
      );
    } catch (error) {
      if (error) {
        this.undoStacks[curSlide].push(oldSlide);
      }
    }
  };

  changeSlide = toSlideNo => {

    const { slides } = this.state;
    this.setState(
      {
        curSlide: toSlideNo
      },
      () => {
        this.pageCount = slides[toSlideNo].pageCount || 0;
        this.setSizeOfPage(this.pageCount);
        this.db.reset();
        this.db.setImg(slides[toSlideNo].note);
        this.simsList.loadDataToSketches();
      }
    );
  };

  updateSlides = (updatedSlides, shouldNotLoad, shouldNotPushToUndoStack) => {
    const { slides, curSlide } = this.state;
    const slide = slides[curSlide];
    if (!shouldNotPushToUndoStack) this.pushToUndoStacks(slide);

    this.setState(
      {
        slides: updatedSlides
      },
      () => {
        if (shouldNotLoad) return;

        this.simsList.loadDataToSketches();
      }
    );
  };

  interact = () => {
    const { interactEnabled } = this.state;

    if (!interactEnabled) {
      $(".upper-canvas")[0].style["pointer-events"] = "none";
      $(".lower-canvas")[0].style["pointer-events"] = "none";
    } else {
      $(".upper-canvas")[0].style["pointer-events"] = "unset";
      $(".lower-canvas")[0].style["pointer-events"] = "unset";
    }

    this.setState(state => ({
      interactEnabled: !state.interactEnabled
    }));
  };

  checkCanvasSize = () => {
    let maxHeight = -Infinity;

    let j = $("textarea").length;
    let textarea;

    while (j > 0) {
      j -= 1;
      textarea = $("textarea")
        .eq(j)
        .parents()
        .eq(1);
      if (textarea.position().top + textarea.height() > maxHeight) {
        maxHeight = textarea.position().top + textarea.height();
      }
    }

    let i = $("iframe").length;
    let iframe;

    while (i > 0) {
      i -= 1;
      iframe = $("iframe")
        .eq(i - 1)
        .parents()
        .eq(3);
      if (iframe.position().top + iframe.height() > maxHeight) {
        maxHeight = iframe.position().top + iframe.height();
      }
    }

    const { scaleX } = this.state;
    if (($(".canvas-cont").height() - 300) * scaleX < maxHeight) return 1;

    return 0;
  };

  undo = () => {
    const { curSlide, slides } = this.state;

    const slide = this.undoStacks[curSlide].pop();

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

  restoreStateBack = slide => {
    const { slides, curSlide } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));
    updatedSlides[curSlide] = slide;

    this.setState(
      {
        slides: updatedSlides
      },
      () => {

        const { curSlide, slides } = this.state;
        this.pageCount = slides[curSlide].pageCount || 0;
        this.setSizeOfPage(this.pageCount);
        this.simsList.loadDataToSketches();
        this.db.reset();
        this.db.setImg(slides[curSlide].note);

        if (!slides[curSlide].note) {
          this.db.reset();
        }
      }
    );
  };

  headToRequestPage = () => {
    this.setState({ redirectToRequest: true });
  };

  changePageCount = option => {

    const temp = this.db.getImg();
    this.pageCount += option;
    $(".upper-canvas")[0].style.height = `${(
      $(".upper-canvas")[0].height +
      option * 300
    ).toString()}px`;
    $(".lower-canvas")[0].style.height = `${(
      $(".lower-canvas")[0].height +
      option * 300
    ).toString()}px`;
    $(".upper-canvas")[0].height += option * 300;
    $(".lower-canvas")[0].height += option * 300;
    $(".canvas-container")[0].style.height = $(".lower-canvas")[0].style.height;
    this.db.b.setHeight($(".upper-canvas")[0].height);
    this.db.setImg(temp);
    const { slides, curSlide } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));
    updatedSlides[curSlide].pageCount = this.pageCount;
    this.updateSlides(updatedSlides);
  };

  addShortResponse = () => {
    const { curSlide, slides } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));

    if (!updatedSlides[curSlide].shortresponse) {
      updatedSlides[curSlide].shortresponse = [];
    }

    const newQuestion = {
      content: "",
      responses: {}
    };

    updatedSlides[curSlide].shortresponse.push(newQuestion);
    this.updateSlides(updatedSlides);
    this.setState({ question: false });
  };

  addMCQ = () => {
    const { curSlide, slides } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));

    if (!updatedSlides[curSlide].questions) {
      updatedSlides[curSlide].questions = [];
    }

    const newQuestion = {
      content: "",
      a: "",
      b: "",
      c: "",
      d: "",
      responses: {}
    };

    updatedSlides[curSlide].questions.push(newQuestion);
    this.updateSlides(updatedSlides);
    this.setState({ question: false });
  };

  addQuestion = () => {
    this.setState({ question: true });
  };

  addTextBox = () => {
    const { curSlide, slides } = this.state;
    const updatedSlides = Object.values($.extend(true, {}, slides));

    if (!updatedSlides[curSlide].textboxes) {
      updatedSlides[curSlide].textboxes = [];
    }

    const newTextBox = {
      value: "new text box"
    };

    updatedSlides[curSlide].textboxes.push(newTextBox);

    this.updateSlides(updatedSlides);
  };

  setCopiedState = set => {
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

    if (this.subject.value === "") {
      subject = this.subject.placeholder;
    } else {
      subject = this.subject.value;
    }

    if (this.topic.value === "") {
      topic = this.topic.placeholder;
    } else {
      topic = this.topic.value;
    }

    if (this.learningObjectives.value === "") {
      learningObjectives = this.learningObjectives.placeholder;
    } else {
      learningObjectives = DOMPurify.sanitize(
        this.learningObjectives.value.replace(
          new RegExp("\r?\n", "g"),
          "<br />"
        )
      );
    }

    if (this.inClassActivities.value === "") {
      inClassActivities = this.inClassActivities.placeholder;
    } else {
      inClassActivities = DOMPurify.sanitize(
        this.inClassActivities.value.replace(new RegExp("\r?\n", "g"), "<br />")
      );
    }

    if (this.resources.value === "") {
      resources = this.resources.placeholder;
    } else {
      resources = DOMPurify.sanitize(
        this.resources.value.replace(new RegExp("\r?\n", "g"), "<br />")
      );
    }

    if (this.assessments.value === "") {
      assessments = this.assessments.placeholder;
    } else {
      assessments = this.assessments.value;
    }

    if (this.standards.value === "") {
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
      standards
    };

    const { _id } = this.state;

    Meteor.call("workbooks.description", _id, description, () => {
      alert("Description addedd successfully");
    });
  };

  checkDescExist = () => {
    const { _id } = this.state;
    const a = Workbooks.find({
      _id,
      description: { $exists: true }
    }).fetch();
    if (a.length !== 0) return true;

    Meteor.call("workbooks.addDescriptionField", _id);
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
      Object.keys(description).length === 0 &&
      description.constructor === Object
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
              __html: description.learningObjectives
            }}
          />
        </List.Item>
        <List.Item>
          <List.Header>In-Class Activites</List.Header>
          <div
            dangerouslySetInnerHTML={{
              __html: description.inClassActivities
            }}
          />
        </List.Item>
        <List.Item>
          <List.Header>Resources</List.Header>
          <div
            dangerouslySetInnerHTML={{
              __html: description.resources
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

  renderLeftMenuHeader = () => {

    const {
      curSlide,
    } = this.state;

    return (
      <>        
        <h1 className="slidecounter">{curSlide + 1}</h1>
      </>
    )
  }

  render() {
    const {
      initialized,
      scaleX,
      slides,
      curSlide,
      interactEnabled,
      userId,
    } = this.state;

    return (
      <>
      <Segment style={{ padding: 0, margin: 0 }}>
        <Dimmer active={!initialized}>
          <Loader />
        </Dimmer>
        <Grid
          style={{
            height: '100vh',
            padding: 0,
            margin: 0,
          }}
          columns={2}
          divided
        >
          <Grid.Row>
            <Grid.Column
              style={{
                textAlign: "center",
                
              }}
              width={2}
            >
              {this.renderLeftMenuHeader()}
              <SlidesList
                slides={slides}
                curSlide={curSlide}
                deleteSlide={this.deleteSlide}
                setStateAfterRearranging={this.setStateAfterRearranging}
                from="createWorkbook"
                isPreview={false}
                changeSlide={this.changeSlide}
              />
            </Grid.Column>
            <Grid.Column
              style={{
                backgroundColor:'black',
                overflowY: "auto",
                overflowX: 'hidden'
              }}
              width={14}
            >
              <div
                className="canvas-cont"
                style={{
                  backgroundColor: "black",
                  width: "1366px",
                  transform: `scale(${scaleX},${scaleX})`,
                  transformOrigin: "top left",
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
                  ref={e => {
                    this.simsList = e;
                  }}
                  save={this.saveToDatabase}
                  interact={this.interact}
                  scale={scaleX}
                />

                <DrawingBoardCmp
                  interactEnabled={interactEnabled}
                  interact={this.interact}
                  ref={e => {
                    this.drawingBoard = e;
                  }}
                  onChange={this.onChange}
                 
                />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>      
      </Segment>
      </>
    );
  }
}


export default withTracker((props) => {
  const workbooksHandle = Meteor.subscribe('workbooks');
  const loading = !workbooksHandle.ready();
  const workbook = Workbooks.findOne(props._id);
  const workbookExists = !loading && !!workbook;

  return {
    workbookExists,
    workbook: workbookExists ? workbook : [],
  };
})(WorkbookViewer);
