import React from 'react';
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

            if (Meteor.user()) {
                this.setState({
                    user: Meteor.user().username
                })
            }
            if (Meteor.user() && Meteor.user().profile) {
                this.setState({
                    type: Meteor.user().profile['accountType']
                })
            }
            if (Meteor.user() && Meteor.user().school) {
                this.setState({
                    school: Meteor.user().school
                })
            }
            else {
                this.setState({
                    type: 'Student'
                })
            }
        })

        Meteor.subscribe('getAccounts');

    }

    render() {
        return (
            <div>
                <div style={{ paddingBottom: '30px' }}>
                    Hello, {this.state.user}! <br />
                    Your account type is {this.state.type}. <br />
                    Your school is {this.state.school}. <br />
                    {
                        (this.state.type === 'Student' || this.state.type === 'Teacher') &&
                        <Form noValidate onSubmit={this.updateSchool} style={{ paddingTop: '20px', width: '25%' }}>
                            <Form.Field>
                                <input ref={e => this.school = e} placeholder='School' />
                            </Form.Field>
                            <Button type='submit' style={{}}> Update School </Button>
                        </Form>
                    }
                </div>
                {/* 
                    The following allows us to fetch a list of all existing users
                    which will be used to create functionality for searching for other users.
                */}
                {/* <b> Existing users </b> 
                {
                    Meteor.users.find().fetch().
                    map(user => (
                     <div> {user.username} </div>   
                    ))   
                } */}
                <TeacherSearch />
            </div>
        )
    }
}

