/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";

import "semantic-ui-css/semantic.min.css";

import { Session } from "meteor/session";

document.title = "Dynamic Learning";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      slides: null
    };
  }

  componentDidMount() {
    /* If the workbook editor is opened without logging in and the user requires to login,
            The slides are stored to meteor sessions with the title stateToSave.
            It is obtained from here.
            If there is no value, returned, else the slides and the title is set to the state.
        */

    const state = Session.get("stateToSave");

    if (!state) {
      return;
    }

    this.setState({
      slides: state.slides,
      title: state.title,
      userId: state.userId,
      _id: state._id
    });
  }

  onSubmit = e => {
    const { slides, userId, _id, title } = this.state;
    e.preventDefault();

    const email = this.email.value.trim();
    const password = this.password.value.trim();

    Meteor.loginWithPassword({ email }, password, err => {
      if (err) {
        this.setState({
          error: "Unable to login. Check email and password"
        });
      } else {
        this.setState(
          {
            error: ""
          },
          () => {
            if (!slides) {
              return;
            }

            /*
            The values in the states are used to create a new workbook and the session variable
            is set to null.
        */

            if (userId === Meteor.userId()) {
              Meteor.call("workbooks.update", _id, slides);
              return;
            }

            // eslint-disable-next-line no-shadow
            Meteor.call("workbooks.insert", title, (_err, _id) => {
              Meteor.call("workbooks.update", _id, slides);
              Session.set("stateToSave", null);
            });
          }
        );
      }
    });
  };

  ghAuth() {
    Meteor.loginWithGithub({}, err => {
      if (err) {
        console.log(err);
        this.setState({ error: "Unable to login with GitHub." });
      } else {
        this.setState({ error: "" });
      }
    });
  }

  googleAuth() {
    Meteor.loginWithGoogle({}, err => {
      if (err) {
        console.log(err);
        this.setState({ error: "Unable to login with Google." });
      } else {
        this.setState({ error: "" });
      }
    });
  }

  render() {
    const { error } = this.state;
    return (
      <div className="login__main">
        <div className='login-box'>
          <Link to='/'>
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
                }}>Login</div>

                <input
                  className='login__input'
                  type="email"
                  ref={e => {
                    this.email = e;
                  }}
                  placeholder="Email"
                />

                <input
                  className='login__input'
                  type="password"
                  ref={e => {
                    this.password = e;
                  }}
                  placeholder="Password"
                />

              <button className='login__button' type="submit">Log in</button>

              <div style={{margin:'1rem'}}>OR</div>

            </form>
          </div>

          <div style={{display:'flex', flexDirection:'row', justifyContent: 'space-around', marginBottom:'1rem'}}>
              <img  onClick={() => this.ghAuth()} className='login__icon__github' src='/github-icon.png'></img>
              <img onClick={() => this.googleAuth()} className='login__icon__google' src='/google-icon.png'></img>
          </div>

          <div style={{marginTop:'2rem'}}>
            <span>Don't have an account ? </span>
            <Link to='/signup'><b><span className='login__create-one'>Create one</span></b></Link>
          </div>
          
        </div>

      </div>
    );
  }
}
