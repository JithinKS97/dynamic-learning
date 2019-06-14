/* eslint-disable */
import React from 'react'
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { Button, Form, Card } from 'semantic-ui-react'
import TeacherSearch from './TeacherSearch';

export default class Profile extends React.Component {

  constructor(props) {

    super(props)
    this.state = {
      user: '',
      type: '',
      school: ''
    }
  }

  updateSchool = () => {
    Meteor.call('updateSchool', this.state.user, this.school.value);
    this.setState({
      school: this.school.value
    })
  }

  componentDidMount() {

    Tracker.autorun(() => {

      Meteor.subscribe('getAccounts');
      Meteor.subscribe('classes');

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
      if (Meteor.user() && Meteor.user().services) {
        if (Meteor.user().services.github) {
          this.setState({
            user: Meteor.user().services.github.username,
            type: 'Standard'
          })
        }
        else if (Meteor.user().services.google) {
          console.log(Meteor.user().services.google)
        }
      }
      if (Meteor.user() && Meteor.user().school) {
        this.setState({
          school: Meteor.user().school
        })
      }

    })

  }

  render() {
    return (
      <div>
        <div>
          Hello, {this.state.user}! <br />
          Your account type is {this.state.type}. <br />
          {
            (this.state.type === 'Student' || this.state.type === 'Teacher') &&
            <div>
              Your school is {this.state.school}. <br />
              <Form noValidate onSubmit={this.updateSchool} style={{ marginTop: '1.2rem', width: '25%' }}>
                <Form.Field>
                  <input ref={e => this.school = e} placeholder='School' />
                </Form.Field>
                <Button type='submit' style={{}}> Update School </Button>

              </Form>
            </div>
          }
        </div>
        {
          this.state.type === 'Teacher' &&
          <div>
            <TeacherSearch />
          </div>
        }
      </div>
    )
  }
}
