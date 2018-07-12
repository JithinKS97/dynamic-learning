import React from 'react'
import { Link } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'

import { Button, Form, Card, Image } from 'semantic-ui-react'

import 'semantic-ui-css/semantic.min.css';

import { Session } from 'meteor/session'
 
export default class Login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            error: '',
            slides:null
        }
    }

    componentDidMount() {

        /* If the createlessonplan is opened without logging in and the user requires to login,
            The slides are stored to meteor sessions with the title stateToSave.
            It is obtained from here.

            If there is no value, returned, else the slides and the title is set to the state.
        */

        const state = Session.get('stateToSave')
        
        if(!state)
            return

        this.setState({            
            slides:state.slides,
            title:state.title
        })

    }

    onSubmit(e) {
        e.preventDefault()

        const email = this.email.value.trim()
        const password = this.password.value.trim()

        Meteor.loginWithPassword({email}, password, (err)=>{

            if(err) {
                this.setState({
                    error: 'Unable to login. Check email and password'
                })
            }
            else {
                
                this.setState({
                    error :''
                },()=>{

                        if(!this.state.slides) {
                            return
                        }
                        
                        /*
                            The values in the states are used to create a new lessonplan and the session variable
                            is set to null.
                        */

                        Meteor.call('lessonplans.insert', this.state.title, (err, _id)=>{
                            
                            Meteor.call('lessonplans.update', _id, this.state.slides)
                            Session.set('stateToSave', null)
                        })                 

                })
            }
        })
    }
    
    render() {

        return (
            <div className = 'boxed-view'>
                <Card>

                    <Card.Content>
                        <Card.Header>Login</Card.Header>
                    </Card.Content>

                    <Card.Content>

                        {this.state.error ? <p>{this.state.error}</p> : undefined}
                        <Form noValidate onSubmit = { this.onSubmit.bind(this) }>
                            <Form.Field>
                                <label>Email</label>
                                <input type = 'email' ref = { e => this.email = e } placeholder='Email' />
                            </Form.Field>

                            <Form.Field>
                                <label>Password</label>
                                <input type = 'password' ref = { e => this.password = e } placeholder='Password' />
                            </Form.Field>

                            <Button type='submit'>Submit</Button>
                        </Form>
                    </Card.Content> 
                    <Card.Content>
                        <Link to = '/signup'>Don't have an account?</Link>
                    </Card.Content> 

                </Card>
            </div>
          
        )
    }
}

