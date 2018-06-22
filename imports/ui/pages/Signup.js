import React from 'react'
import { Link } from 'react-router-dom'
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'

import { Button, Form, Card } from 'semantic-ui-react'

import 'semantic-ui-css/semantic.min.css';

export default class Signup extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            error: '',
            slides:null
        }
    }

    componentDidMount() {

        if(!localStorage.getItem('slidesToSave'))
            return

        const slides = JSON.parse(localStorage.getItem('slidesToSave'))

        this.setState({            
            slides
        })

    }

    onSubmit(e) {
        e.preventDefault()

        const email = this.email.value.trim()
        const password = this.password.value.trim()
        const username = this.username.value.trim()

        if(password.length<9) {

            this.setState({
                error: 'Password must be more than 8 characters long'
            })
            return
        }

        Accounts.createUser({email,username,password},(err) => {

            if(err) {
                this.setState({
                    error:err.reason
                })
            }
            else {

                this.setState({
                    error: ''                   
                },()=>{

                    if(!this.state.slides)
                    {   
                        return
                    }

                    Meteor.call('lessonplans.insert', 'My New LessonPlan',(err, _id)=>{

                        Meteor.call('lessonplans.update', _id, this.state.slides, ()=>{

                            localStorage.removeItem('slidesToSave');

                            this.setState({
                                slides:null
                            }) 
                        })
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
                        <Card.Header>Signup</Card.Header>
                    </Card.Content>

                    <Card.Content>

                        {this.state.error ? <p>{this.state.error}</p> : undefined}
                    
                        <Form onSubmit = {this.onSubmit.bind(this)} noValidate>
                            <Form.Field>
                                <label>Username</label>
                                <input ref= { e => this.username = e } placeholder='Username'/>
                            </Form.Field>
                            <Form.Field>
                                <label>Email</label>
                                <input type='email' ref= { e => this.email = e } placeholder='Email'/>
                            </Form.Field>    
                            <Form.Field>
                                <label>Password</label>
                                <input type='password' ref= { e => this.password = e } placeholder='Password'/>
                            </Form.Field>
                            <Button>Create Account</Button>
                        </Form>

                    </Card.Content>

                    <Card.Content>
                        <Link className = 'link' to='/'>Already have an account?</Link>
                    </Card.Content>
                </Card>
            </div>
        );
    }
}