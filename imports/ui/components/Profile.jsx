import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Button, Form } from 'semantic-ui-react';
import TeacherSearch from './TeacherSearch';

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      type: '',
      school: '',
    };
  }

  componentDidMount() {
    Meteor.subscribe('getAccounts');
    Meteor.subscribe('classes');

    Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          user: Meteor.user().username,
        });
      }
      if (Meteor.user() && Meteor.user().profile) {
        this.setState({
          type: Meteor.user().profile.accountType,
        });
      } else {
        this.setState({
          type: 'Student',
        });
      }
      if (Meteor.user() && Meteor.user().school) {
        this.setState({
          school: Meteor.user().school,
        });
      }
    });
  }

  updateSchool = () => {
    const { user, school } = this.state;
    Meteor.call('updateSchool', user, school.value);
    this.setState({
      school: this.school.value,
    });
  }

  render() {
    const { type, user, school } = this.state;

    return (
      <div>
        <div>
          Hello,
          {' '}
          {' '}
          {user}
          !
          {' '}
          <br />
          Your account type is
          {' '}
          {type}
          .
          {' '}
          <br />
          Your school is
          {' '}
          {school}
          .
          {' '}
          <br />
          {
            (type === 'Student' || type === 'Teacher')
            && (
            <Form noValidate onSubmit={this.updateSchool} style={{ marginTop: '1.2rem', width: '25%' }}>
              <Form.Field>
                <input ref={(e) => { this.school = e; }} placeholder="School" />
              </Form.Field>
              <Button type="submit" style={{}}> Update School </Button>
            </Form>
            )
          }
        </div>
        {
          type === 'Teacher'
          && (
          <div>
            <TeacherSearch />
          </div>
          )
        }
      </div>
    );
  }
}
