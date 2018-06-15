import React from 'react'
import { Link } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'

import { Button, Form, Card } from 'semantic-ui-react'

import 'semantic-ui-css/semantic.min.css';
 
export default class Login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            error: ''
        }
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


{/* <h1>Dynamic Learning</h1>
{this.state.error ? <p>{this.state.error}</p> : undefined}

<Form onSubmit = {this.onSubmit.bind(this)} noValidate>
    <Form.Field type='email' ref= { e => this.email = e} name='email' placeholder='Email'/>
    <input type='password' ref= {e => this.password = e} name='password' placeholder='Password'/>
    <Button>Sign in</Button>
</Form>

<Link to='/signup'>Don't have an account?</Link> */}