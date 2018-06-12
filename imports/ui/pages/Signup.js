import React from 'react'
import { Link } from 'react-router-dom'
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'

export default class Signup extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            error: ''
        }
    }

    onSubmit(e) {
        e.preventDefault()

        const email = this.refs.email.value.trim()
        const password = this.refs.password.value.trim()
        const username = this.refs.username.value.trim()

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

                Meteor.call('directories.insert', Meteor.userId())

                this.setState({
                    error: ''                   
                })
            }
        })
    }
    
    render() {
        return (
            <div className = 'boxed-view'>
                <div className = 'boxed-view__box'>
                    <h1>Sign up</h1>

                    {this.state.error ? <p>{this.state.error}</p> : undefined}
                
                    <form className = 'boxed-view__form' onSubmit = {this.onSubmit.bind(this)} noValidate>
                        <input type='username' ref='username' name='username' placeholder='Username'/>
                        <input type='email' ref='email' name='email' placeholder='Email'/>
                        <input type='password' ref='password' name='password' placeholder='Password'/>
                        <button className = 'button'>Create Account</button>
                    </form>

                    <Link className = 'link' to='/'>Already have an account?</Link>
                    
                </div>
            </div>
        );
    }
}