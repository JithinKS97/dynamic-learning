/* eslint-disable */
import React from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base'

import "semantic-ui-css/semantic.min.css";


export default class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      loading: false
    };
  }

  componentDidMount() {
  }

  onSubmit = e => {
    e.preventDefault();

    this.setState({ 
      error: "",
      loading: true
    });

    const email = this.email.value.trim();

    if(email == ""){
      this.setState({ 
        error: "Please enter a valid Email.",
        loading: false
      });
      return
    }

    const options = {
      email
    };

    Accounts.forgotPassword(options, (err) => {
      if (err) {
        if(err.message === 'User not found [403]'){
          this.setState({ 
            error: "Email not registered.",
            loading:false
          });
        }
        else{
          this.setState({
            error: "We are sorry but something went wrong.",
            loading: false
          });
        }
      } else {
        this.setState({ 
          error: "Password reset email sent successfully",
          loading: false
        });
      }
    });

  };

  render() {
    const { error, loading } = this.state;
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
            {loading ? <p style={{marginTop:'1rem'}}>Loading ...</p> : undefined}
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
                }}>Forgot Password</div>

                <input
                  className='login__input'
                  type="email"
                  ref={e => {
                    this.email = e;
                  }}
                  placeholder="Registered Email"
                  required
                />  

                <button 
                className='login__button' 
                style={{width:'20rem'}} 
                type="submit"
                >
                Sent reset password link
                </button>

            </form>

          </div>

        </div>

      </div>
    );
  }
}
