import React from 'react'
import { Link } from 'react-router-dom'
import { Accounts } from 'meteor/accounts-base'

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
                this.setState({
                    error: ''
                })
            }
        })
    }
    
    render() {
        return (
            <div>
                <h1>Join Dynamic Learning</h1>

                {this.state.error ? <p>{this.state.error}</p> : undefined}
            
                <form onSubmit = {this.onSubmit.bind(this)} noValidate>
                    <input type='email' ref='email' name='email' placeholder='Email'/>
                    <input type='username' ref='username' name='username' placeholder='username'/>
                    <input type='password' ref='password' name='password' placeholder='Password'/>
                    <button>Create Account</button>
                </form>

                <Link to='/'>Already have an account?</Link>
                
            </div>
        );
    }
}