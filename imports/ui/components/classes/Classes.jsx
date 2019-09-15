import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import TeacherClasses from './TeacherClasses';
import StudentClasses from './StudentClasses';

export default class Classes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: '',
    };
  }

  componentDidMount() {
    Meteor.subscribe('getAccounts');
    Meteor.subscribe('classes');

    Tracker.autorun(() => {
      if (Meteor.user() && Meteor.user().profile) {
        this.setState({
          type: Meteor.user().profile.accountType,
        });
      } else {
        this.setState({
          type: 'Student',
        });
      }
    });
  }

  render() {
    const { type } = this.state;
    return (
      <div>
        {type === 'Teacher' && <TeacherClasses />}
        {type === 'Student' && <StudentClasses />}
      </div>
    );
  }
}
