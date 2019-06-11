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
        })
      }
      if (Meteor.user() && Meteor.user().profile) {
        this.setState({
          type: Meteor.user().profile['accountType']
        })
      }
      if (Meteor.user() && Meteor.user().services && Meteor.user().services.github) {
        this.setState({
          user: Meteor.user().services.github.username,
          type: 'Standard'
        })
      }
      if (Meteor.user() && Meteor.user().services && Meteor.user().services.google) {
        console.log(Meteor.user().services.google)
      }
      if (Meteor.user() && Meteor.user().school) {
        this.setState({
          school: Meteor.user().school,
        });
      }
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
          {
            (type === 'Student' || type === 'Teacher')
            && (
              <div> 
                Your school is
          {' '}
          {school}
          .
          {' '}
          <br />
            <Form noValidate onSubmit={this.updateSchool} style={{ marginTop: '1.2rem', width: '25%' }}>
              <Form.Field>
                <input ref={(e) => { this.school = e; }} placeholder="School" />
              </Form.Field>
              <Button type="submit" style={{}}> Update School </Button>
            </Form>
            </div> 
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
