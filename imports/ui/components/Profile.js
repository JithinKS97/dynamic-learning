import React from 'react'
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Tracker } from 'meteor/tracker'
import { Requests } from '../../api/requests'

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
        
        Meteor.subscribe('getAccounts'); 
    }

    render() {
        return (
            <div> 
                <div style={{paddingBottom: '30px'}}> 
                Hello, {this.state.user}! <br /> 
                Your account type is {this.state.type}. <br /> 
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
            </div>
        )
    }
}

