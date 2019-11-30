/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Tracker } from 'meteor/tracker';
import {
  Dimmer, Loader,
} from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import SearchBar from './SearchBar';
import { LessonsIndex } from '../../../api/lessons';

export default class SharedLessons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lessons: [],
      redirectToLesson: false,
      selectedLesson: null,
      loading: true,
      _idToNameMappings: {},
    };
  }

  componentDidMount() {
    this.lessonsTracker = Tracker.autorun(() => {
      this.lessonsHandle = Meteor.subscribe('lessons.public');
      const loading = !this.lessonsHandle.ready();
      const lessons = LessonsIndex.search('').fetch();
      if (!lessons) { return; }
      this.setState({
        lessons,
        loading,
      }, () => {
        Meteor.call(
          'getUsernames',
          lessons.map(workbook => workbook.userId),
          (_err, users) => {
            const _idToNameMappings = {};
            users.map((user) => {
              _idToNameMappings[user.userId] = user.username;
            });
            this.setState({
              _idToNameMappings,
            });
          },
        );
      });
    });
  }

  componentWillUnmount() {
    this.lessonsTracker.stop();
  }

  findTime = time => moment(time);

  displayTime = (index) => {
    const { lessons } = this.state;
    if (lessons.length > 0) {
      return this.findTime(lessons[index].createdAt).fromNow();
    }
  };

  renderLessons = () => {
    const { lessons, _idToNameMappings } = this.state;
    return lessons.map((lesson, index) => (
      <div
        className="sharedResources__listItem"
        onClick={() => {
          this.setState({
            selectedLesson: lesson,
          }, () => {
            this.setState({
              redirectToLesson: true,
            });
          });
        }}
        style={{ paddingLeft: '2.4rem' }}
        key={lesson.createdAt}
      >
        <div className="sharedResources__listItem-title">
          {lesson.title}
        </div>
        <div className="sharedResources__listItem-detail">
          <div>{_idToNameMappings[lesson.userId]}</div>
          <div>{this.displayTime(index)}</div>
        </div>
      </div>
    ));
  }

  getId = () => {
    const { selectedLesson } = this.state;
    if (!selectedLesson) { return; }

    if (selectedLesson.__originalId === undefined) { return selectedLesson._id; }
    return selectedLesson.__originalId;
  }

  search = (searchTag) => {
    Tracker.autorun(() => {
      this.setState({
        lessons: LessonsIndex.search(searchTag).fetch(),
      });
    });
  }

  render() {
    const { redirectToLesson, loading } = this.state;
    if (redirectToLesson) {
      return <Redirect to={`/lesson/${this.getId()}`} />;
    }

    return (
      <div>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
        <SearchBar onChange={this.search} />
        <div style={{ marginTop: '2rem' }}>
          {this.renderLessons()}
        </div>
      </div>
    );
  }
}
