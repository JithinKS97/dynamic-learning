/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
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
      _idToNameMappings: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lesson.members) {
      if (this.props.lesson) {
        Meteor.call('getUsernames', nextProps.lesson.members, (_err, memberNameUserIds) => {
          const _idToNameMappings = {};
          memberNameUserIds.map((member) => {
            _idToNameMappings[member.userId] = member.username;
          });
          this.setState({
            _idToNameMappings,
          });
        });
      }
    }
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
      comments: [],
    };

    slides.push(newSlide);

    this.updateSlides(slides, 'ownerOp');
  }


  changeSlide = (toSlideNo) => {
    this.setState({
      curSlide: toSlideNo,
    });
  }

  updateSlides = (updatedSlides, operation, args) => {
    if (!Meteor.userId()) { return; }

    const { lesson: { _id } } = this.props;

    Meteor.call('lessons.update', _id, updatedSlides, operation, args);

    if (!this.props.lesson.members.includes(Meteor.userId())) {
      Meteor.call('lessons.addMember', _id);
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
      this.changeSlide(curSlide);
      this.updateSlides(slides);
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
            <Grid.Row divided style={{ height: '80vh' }} className="vidsim">
              <Grid.Column style={{ padding: '2.4rem', width: '50vw' }}>

                <Link to="/dashboard/lessons"><Button style={{ marginBottom: '0.8rem' }} className="lessonbutton">Back to dashboard</Button></Link>

                {/** Share check box should be visible only to the owner of the lesson */}

                {lesson.userId === Meteor.userId() ? (
                  <Checkbox
                    className="sharelesson"
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
                  className="lessonbutton"
                >
                  Add Sim

                </Button>
                {/**
                  AddSim component adds a sim to the lesson. See the function addToLesson function
                  inside the AddSim component to know how the sim gets added.
              */}

                <AddSim
                  updateSlides={this.updateSlides}
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
                changeSlide={this.changeSlide}
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
          <div style={{ margin: '2.4rem' }} className="forum">
            <CommentsList
              _idToNameMappings={this.state._idToNameMappings}
              slides={this.props.lesson.slides}
              curSlide={this.state.curSlide || 0}
              isMember
              isAuthenticated
              updateSlides={this.updateSlides}
              currentUserId={Meteor.userId()}
            />
            <CommentForm
              indexOfComment={-1}
              slides={this.props.lesson.slides}
              curSlide={0}
              updateSlides={this.updateSlides}
              isMember
              isAuthenticated
              currentUserId={Meteor.userId()}
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
