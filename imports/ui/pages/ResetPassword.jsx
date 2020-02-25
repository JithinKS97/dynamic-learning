/* eslint-disable */
import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';

import "semantic-ui-css/semantic.min.css";


export default class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ""
    };
  }

  componentDidMount() {
  }

  onSubmit = e => {
    e.preventDefault();

    const password = this.password.value.trim();
    const cpassword = this.cpassword.value.trim();

    if (password.length < 9) {
        this.setState({ error: "Password must be more than 8 characters long." });
        return
    }

    if(password != cpassword){
        this.setState({ error: "Passwords not matching." });
        return
    }

    const token = this.props.match.params._id ;

    Accounts.resetPassword(token, password, (err) => {
        if (err) {
            this.setState({error: "We are sorry but something went wrong."});  
        } else {
            this.props.history.push('/login');
        }
    });


  };

  render() {
    const { error } = this.state;
    return (
      <div className="login__main">
        <div className='login-box'>
          <Link to='/login'>
           <div className='login-close__button'>X</div>
          </Link>
          <img
            className="login__logo"
            src="/symbol.png"
          ></img>
          <div>
            {error ? <p style={{marginTop:'1rem'}}>{error}</p> : undefined}
            <form noValidate onSubmit={this.onSubmit}>

              <div style={{
                  float:'left', 
                  marginBottom:'1rem',
                  marginTop:'2rem',
                  marginLeft:'1rem',
                  color:'grey',
                  fontSize:'1.3rem',
                  display:'block'
                }}>Reset Password</div>

                <input
                  className='login__input'
                  type="password"
                  ref={e => {
                    this.password = e;
                  }}
                  placeholder="Password"
                  required
                />
                
                <input
                  className='login__input'
                  type="password"
                  ref={e => {
                    this.cpassword = e;
                  }}
                  placeholder="Confirm Password"
                  required
                />

                <button 
                className='login__button' 
                style={{width:'15rem'}} 
                type="submit"
                >
                Reset Password
                </button>

            </form>

          </div>

        </div>

      </div>
    );
  }
}
