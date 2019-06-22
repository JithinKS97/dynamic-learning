import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Grid, Button, Dimmer, Loader, Checkbox,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Lessons } from '../../api/lessons';
import HorizontalList from '../components/HorizontalList';
import 'semantic-ui-css/semantic.min.css';
import VideoContainer from '../components/VideoContainer';
import SimsList from '../components/SimsList';
import AddSim from '../components/AddSim';
// import LessonComment from '../components/LessonComment';
import Votes from '../components/Votes';
import CommentForm from '../components/CommentForm';
import CommentsList from '../components/CommentsList';

class Lesson extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      /**
       * curSlide keeps track of the current slide on which we are in
       */

      curSlide: 0,
    };
  }

  addNewSlide = () => {
    /**
     * This function adds a new slide to the slides array
     * CurSlide and slides are obtained from state and props
     * Function pushSlide is called passing in slides
     * The curSlide is set to the index of the new slide added
     */

    let { curSlide } = this.state;
    const { lesson } = this.props;
    const { slides } = lesson;
    this.pushSlide(slides);
    curSlide = slides.length - 1;
    this.setState({
      curSlide,
    });
  }

  pushSlide = (slides) => {
    /* To create a new slide, first the structure of slide is defined and
        sthen pushed to the slides array.
    */

    const newSlide = {
      url: null,
      iframes: [],
    };

    slides.push(newSlide);

    /**
     * Save saves the current state of slides to database
     */

    const { lesson } = this.props;

    this.save(lesson._id, slides);
  }

  save = (_id, slides) => {
    if (!Meteor.userId()) { return; }

    /**
     * Look at imports/api/lessons to to see the Meteor method 'lessons.update'
     * which is called from here
     */

    Meteor.call('lessons.update', _id, slides);
  }

  saveChanges = (slides, curSlide) => {
    /**
     * This function is used to save any changes happening to the state
     * It accepts 2 parameters slides and curSlide
     *
     */

    const { lesson } = this.props;

    if (slides === undefined) {
      this.setState({
        curSlide,
      });
    } else if (curSlide === undefined) {
      this.setState({
      }, () => {
        this.save(lesson._id, slides);
      });
    } else {
      this.setState({
        curSlide,
      }, () => {
        this.save(lesson._id, slides);
      });
    }
  }

  deleteSlide = (index) => {
    /* This function decides what to do when the X button is pressed in the
      slide element. If there is only one element. it is not deleted,
      it is just reset. Otherwise, the slide is deleted and the current slide is set.
    */

    const { lesson } = this.props;
    const { slides } = lesson;

    if (lesson.userId !== Meteor.userId()) { return; }

    const confirmation = confirm('Are you sure you want to delete the slide?');
    if (!confirmation) { return; }

    if (slides.length !== 1) {
      slides.splice(index, 1);

      let { curSlide } = this.state;

      if (index === 0) {
        curSlide = 0;
      }
      if (curSlide === slides.length) { curSlide = slides.length - 1; }
      this.saveChanges(slides, curSlide);
    } else {
      this.reset();
    }
  }

  reset = () => {
    /**
     * It resets the full lesson
     * It first empties the slide and pushes a new slide into it
     */

    const { lesson } = this.props;

    const slides = [];
    slides.push({
      url: null,
      iframes: [],
    });
    this.save(lesson._id, slides);
  }

  addVideo = (url) => {
    /**
     * Adds video to the current slide
     * We should not allow the user to add video if he is not the owner which is checked by
     * lesson.userId === Meteor.userId()
     */

    const { lesson } = this.props;
    const { curSlide } = this.state;

    if (lesson.userId !== Meteor.userId()) { return; }

    const { slides } = lesson;
    slides[curSlide].url = url;
    this.save(lesson._id, slides);
  }

    deleteSim = (index) => {
      /**
       * Deletes a particular sim in the slide
       * It accepts the index of the sim to be deleted
       * Takes a slide and delets slides[curSlide].iframes[index]
       */
      const { lesson } = this.props;
      const { curSlide } = this.state;

      if (lesson.userId !== Meteor.userId()) { return; }

      const { slides } = lesson;
      const { iframes } = slides[curSlide];
      iframes.splice(index, 1);
      slides[curSlide].iframes = iframes;
      this.save(lesson._id, slides);
    }

    render() {
      const { lessonExists, lesson } = this.props;
      const { curSlide } = this.state;
      return (
        <div>
          <Dimmer inverted active={!lessonExists}>
            <Loader />
          </Dimmer>

          <Grid divided="vertically" style={{ height: '100vh', boxSizing: 'border-box' }}>
            <Grid.Row divided style={{ height: '80vh' }}>
              <Grid.Column style={{ padding: '2.4rem', width: '50vw' }}>

                <Link to="/dashboard/lessons"><Button style={{ marginBottom: '0.8rem' }}>Back to dashboard</Button></Link>

                {/** Share check box should be visible only to the owner of the lesson */}

                {lesson.userId === Meteor.userId() ? (
                  <Checkbox
                    checked={lesson.shared}
                    ref={(e) => { this.checkbox = e; }}
                    onChange={() => {
                      Meteor.call('lessons.shareLesson', lesson._id, !this.checkbox.state.checked);
                    }}
                    style={{ paddingLeft: '1.6rem' }}
                    label="share the lesson"
                  />
                ) : null}

                <Votes lessonid={lesson._id} />

                <VideoContainer
                  userId={lesson.userId}
                  addVideo={this.addVideo}
                  url={
                      lesson.slides[curSlide]
                        ? lesson.slides[curSlide].url
                        : null
                  }
                />

              </Grid.Column>
              <Grid.Column style={{
                padding: '2.4rem',
                width: '50vw',
                height: '100%',
                textAlign: 'center',
                overflow: 'auto',
              }}
              >

                <Button
                  style={{ marginBottom: '0.8rem', visibility: lesson.userId === Meteor.userId() ? 'visible' : 'hidden' }}
                  onClick={() => { this.addSim.addSim(); }}
                >
                  Add Sim

                </Button>
                :
                {/**
                  AddSim component adds a sim to the lesson. See the function addToLesson function
                  inside the AddSim component to know how the sim gets added.
              */}

                <AddSim
                  updateSlides={this.saveChanges}
                  slides={lesson.slides}
                  curSlide={curSlide}
                  isPreview
                  ref={(e) => { this.addSim = e; }}
                />

                {/**
                  SimsList renders the list of sims added
              */}

                <SimsList
                  save={this.save}
                  userId={lesson.userId}
                  isRndRequired={false}
                  deleteSim={this.deleteSim}
                  {...lesson}
                  curSlide={curSlide}
                />

              </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{
              height: '20vh', padding: '1.6rem', display: 'flex', alignItems: 'center',
            }}
            >
              <h1 style={{ padding: '1.6rem', border: 'auto auto' }}>{curSlide + 1}</h1>
              <HorizontalList
                userId={lesson.userId}
                deleteSlide={this.deleteSlide}
                saveChanges={this.saveChanges}
                slides={lesson.slides}
              />
              {lesson.userId === Meteor.userId() ? (
                <Button
                  onClick={this.addNewSlide}
                  style={{ marginLeft: '1.6rem' }}
                >
                  +
                </Button>
              ) : null}
            </Grid.Row>
          </Grid>
          {/* <LessonComment
            lessonid={lesson._id}
          /> */}
          <div style={{ margin: '2.4rem' }}>
            <CommentsList
              slides={[{ comments: [{ comment: 'Comment', replies: [{ comment: 'Reply' }] }] }]}
              curSlide={0}
              isMember
              isAuthenticated
              updateSlides={() => {}}
            />
            <CommentForm
              indexOfComment={-1}
              slides={[{ comments: [] }]}
              curSlide={0}
              updateSlides={() => {}}
              isMember
              isAuthenticated
            />
          </div>
        </div>

      );
    }
}

Lesson.propTypes = {
  lesson: PropTypes.shape({
    userId: PropTypes.string,
    slides: PropTypes.array,
    title: PropTypes.string,
    isFile: PropTypes.bool,
    parent_id: PropTypes.string,
    shared: PropTypes.bool,
    updatedAt: PropTypes.number,
    createdAt: PropTypes.number,
  }).isRequired,
  lessonExists: PropTypes.bool.isRequired,
};

const CreateLessonContainer = withTracker(({ match }) => {
  Meteor.subscribe('lessons.public');
  const lessonsHandle = Meteor.subscribe('lessons');
  const loading = !lessonsHandle.ready();
  const lesson = Lessons.findOne(match.params._id);
  const lessonExists = !loading && !!lesson;

  return {

    lesson: lessonExists ? lesson : { slides: [] },
    lessonExists,
  };
})(Lesson);

export default CreateLessonContainer;
