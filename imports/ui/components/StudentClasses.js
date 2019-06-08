import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { Button, Form, Card, Modal } from 'semantic-ui-react'
import { Classes } from '../../api/classes';

export default class StudentClasses extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            user: '',
            classes: []
        }

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

    getClasses = () => {
        let user = Meteor.users.find({ username: this.state.user }).fetch()[0];
        let clnames = [];
        if (user.classes) {
            user.classes.map(c => {
                let cl = Classes.find({ classcode: c }).fetch()[0];
                clnames.push(cl);
            })
        }
        return clnames;
    }

    addStudent = (classcode, student) => {
        Meteor.call('classes.addstudent', classcode, student);
    }

    addClass = () => {
        const foundclass = Classes.findOne({ classcode: this.classcode.value });
        if (foundclass && !(this.state.classes.includes(foundclass.classcode))) {
            this.addStudent(this.classcode.value, this.state.user);
            this.state.classes.push(this.classcode.value);
        }
    }

    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    handleOpen = (classcode) => {
        this.setState({
            modalOpen: true,
            clickedclass: classcode
        })
    }

    classmatelist = (clickedclass) => {
        let classmates = []
        if (clickedclass) {
            Classes.findOne({ classcode: clickedclass }).roster.map(
                student => {
                    classmates.push(student);
                }
            )
            return classmates;
        }
    }

    render() {
        return (
            <div>
                <Form style={{ paddingTop: '20px', width: '25%' }} noValidate onSubmit={() => this.addClass()}>
                    <Form.Field>
                        <input ref={e => this.classcode = e} placeholder='Class code' />
                    </Form.Field>
                    <Button type='submit'> Add new class </Button>
                </Form>
                <div style={{ paddingTop: '5px' }}>
                    <b> Your current classes </b>
                </div>
                {this.state.user !== '' && this.getClasses().map(cl => {
                    return (<div onClick={() => this.handleOpen(cl.classcode)} style={{ paddingTop: '5px' }}> {cl.name + ': ' + cl.classcode} </div>)
                })}

                <Modal
                    open={this.state.modalOpen}
                    onClose={() => this.handleClose()}
                    size='tiny'
                >
                    <Modal.Header>
                        Other students in your class
                    <Button className='close-button' onClick={() => this.handleClose()}>
                            X
                    </Button>
                    </Modal.Header>

                    <Modal.Content>
                        <Modal.Description>
                            {this.state.clickedclass && this.classmatelist(this.state.clickedclass).map(student => {
                                return (<div> {student} </div>);
                            })}
                        </Modal.Description>

                    </Modal.Content>

                </Modal>
            </div>
        )
    }
}