import React from 'react';
import { Tracker } from 'meteor/tracker';
import {
  List, Input, Dimmer, Loader,
} from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import { LessonsIndex } from '../../../api/lessons';

export default class SharedLessons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      lessons: [],
      redirectToLesson: false,
      selectedLesson: null,
      loading: true,
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
      });
    });
  }

  componentWillUnmount() {
    this.lessonsTracker.stop();
  }

  renderLessons = () => {
    const { lessons } = this.state;
    return lessons.map(lesson => (
      <List.Item
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
        {lesson.title}
      </List.Item>
    ));
  }

  getId = () => {
    const { selectedLesson } = this.state;
    if (!selectedLesson) { return; }

    if (selectedLesson.__originalId === undefined) { return selectedLesson._id; }
    return selectedLesson.__originalId;
  }

  search = (event, data) => {
    Tracker.autorun(() => {
      this.setState({
        lessons: LessonsIndex.search(data.value).fetch(),
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
        <Input ref={(e) => { this.searchTag = e; }} onChange={this.search} label="search" />
        <List

          selection
          verticalAlign="middle"
          style={{ height: window.innerHeight - 150 }}
        >
          {this.renderLessons()}
        </List>
      </div>
    );
  }
}
