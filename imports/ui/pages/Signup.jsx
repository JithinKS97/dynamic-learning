import React from "react";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";

import { button, Form, Card } from "semantic-ui-react";
import { Session } from "meteor/session";

import "semantic-ui-css/semantic.min.css";

const vals = [
  { key: "s", text: "Student", value: "Student" },
  { key: "t", text: "Teacher", value: "Teacher" },
  { key: "d", text: "Standard", value: "Standard" }
];

export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      slides: null
    };
  }

  componentDidMount() {
    /* If the workbook editor is opened without logging in and the user requires to sign up,
            The slides are stored to meteor sessions with the title stateToSave.
            It is obtained from here.

            If there is no value, returned, else the slides and the title is set to the state.
        */

    const state = Session.get("stateToSave");

    if (!state) return;

    this.setState({
      slides: state.slides,
      title: state.title
    });
  }

  onSubmit = e => {
    e.preventDefault();

    const email = this.email.value.trim();
    const password = this.password.value.trim();
    const username = this.username.value.trim();
    const accountType = this.accountType.trim();

    if (password.length < 9) {
      this.setState({
        error: "Password must be more than 8 characters long"
      });
      return;
    }

    const options = {
      email,
      username,
      password,
      school: "",
      classes: [],
      profile: {
        accountType
      }
    };

    Accounts.createUser(options, err => {
      if (err) {
        this.setState({
          error: err.reason
        });
      } else {
        this.setState(
          {
            error: ""
          },
          () => {
            const { slides, userId, title } = this.state;

            if (!slides) {
              return;
            }

            if (userId === Meteor.userId()) return;

            /*
                The values in the states are used to create a
                new workbook and the session variable
                is set to null.
            */

            Meteor.call("workbooks.insert", title, (_err, _id) => {
              Meteor.call("workbooks.update", _id, slides);

              Session.set("stateToSave", null);
            });
          }
        );
      }
    });
  };

  render() {
    const { error } = this.state;
    return (
      <div className="login__main">
        <div className="login-box">
          <img
            className="login__logo"
            src="/symbol.png"
          ></img>
          {error ? <p>{error}</p> : undefined}

          <form noValidate onSubmit={this.onSubmit}>
            <input
              className='login__input'
              ref={e => {
                this.username = e;
              }}
              placeholder="Username"
            />

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

            <Form.Select
              style={{marginTop:'1rem', width:'20rem', borderRadius:'1rem', padding:'1rem', color:'grey'}}
              onChange={(_e, { value }) => {
                this.accountType = value;
              }}
              options={vals}
              placeholder="Account Type"
            />

            <button className='login__button'>Sign up</button>

            <div style={{marginTop:'2rem'}}>
              <span>Already have an account ? </span>
              <Link to='/login'><b><span className='login__create-one'>Log in</span></b></Link>
            </div>

          </form>
        </div>
      </div>
    );
  }
}
