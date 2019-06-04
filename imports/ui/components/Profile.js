import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { Button, Form, Card } from 'semantic-ui-react'
import TeacherSearch from './TeacherSearch';
import TeacherClasses from './TeacherClasses';
import { Classes } from '../../api/classes';

export default class Profile extends React.Component {

    constructor(props) {

        super(props)
        this.state = {
            user: '',
            type: '',
            school: '',
            classes: []
        }

    }

    updateSchool = () => {
        Meteor.call('updateSchool', this.state.user, this.school.value);
        this.setState({
            school: this.school.value
        })
    }

    randomClassCode = () => {
        return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
    }

    // this function can ONLY be called by a teacher, will allow a new class to be created
    createClass = (className) => {
        const code = this.randomClassCode();
        this.state.classes.push(code);
        Meteor.call('classes.insert', code, className, this.state.user);
    }

    addStudent = (classcode, student) => {
        Meteor.call('classes.addstudent', classcode, student);
    }

    getClasses = () => {
        let user = Meteor.users.find({ username: this.state.user }).fetch()[0];
        let clnames = [];
        if (user.classes) {
            user.classes.map(c => {
                let cl = Classes.find({ classcode: c }).fetch()[0];
                clnames.push(cl.name);
            })
        }
        return clnames;
    }

    componentDidMount() {

        Meteor.subscribe('getAccounts');
        Meteor.subscribe('classes');

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
            else {
                this.setState({
                    type: 'Student'
                })
            }
            if (Meteor.user() && Meteor.user().school) {
                this.setState({
                    school: Meteor.user().school
                })
            }
            if (Meteor.user() && Meteor.user().classes) {
                this.setState({
                    classes: Meteor.user().classes
                })
            }
            else {
                this.setState({
                    classes: []
                })
            }
        })
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
                <div style={{ paddingBottom: '30px' }}>
                    <TeacherSearch />
                </div>
                <TeacherClasses />
            </div>
        )
    }
}

