import React from 'react'
import { Link } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'

import { Button, Form, Card } from 'semantic-ui-react'

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

                    if(!this.state.slides)
                    {
                        return
                    }


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
                        <Form onSubmit = { this.onSubmit.bind(this) }>
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

