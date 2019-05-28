import React from 'react'
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'

export default class Profile extends React.Component {

    constructor(props) {

        super(props)
        this.state = {
            user: '', 
            type: ''
        }

    }

    componentDidMount() {

        Tracker.autorun(() => {

            if (Meteor.user())
                this.setState({
                    user: Meteor.user().username
                })
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

        })
    }

    render() {
        return (
            <div> 
                Hello, {this.state.user}! <br /> 
                Your account type is {this.state.type}.
            </div>
        )
    }
}

