/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

import { Button, Form, Card } from 'semantic-ui-react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import 'semantic-ui-css/semantic.min.css';

import { Session } from 'meteor/session';

document.title = "Dynamic Learning";

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      slides: null,
    };
  }

  componentDidMount() {
    /* If the createworkbook is opened without logging in and the user requires to login,
            The slides are stored to meteor sessions with the title stateToSave.
            It is obtained from here.
            If there is no value, returned, else the slides and the title is set to the state.
        */

    const state = Session.get('stateToSave');

    if (!state) { return; }

    this.setState({
      slides: state.slides,
      title: state.title,
      userId: state.userId,
      _id: state._id,
    });
  }

  onSubmit = (e) => {
    const {
      slides, userId, _id, title,
    } = this.state;
    e.preventDefault();

    const email = this.email.value.trim();
    const password = this.password.value.trim();

    Meteor.loginWithPassword({ email }, password, (err) => {
      if (err) {
        this.setState({
          error: 'Unable to login. Check email and password',
        });
      } else {
        this.setState({
          error: '',
        }, () => {
          if (!slides) {
            return;
          }

          /*
            The values in the states are used to create a new workbook and the session variable
            is set to null.
        */

          if (userId === Meteor.userId()) {
            Meteor.call('workbooks.update', _id, slides);
            return;
          }

          // eslint-disable-next-line no-shadow
          Meteor.call('workbooks.insert', title, (_err, _id) => {
            Meteor.call('workbooks.update', _id, slides);
            Session.set('stateToSave', null);
          });
        });
      }
    });
  }

  ghAuth() {
    Meteor.loginWithGithub({},
      (err) => {
        if (err) {
          console.log(err);
          this.setState({ error: 'Unable to login with GitHub.' });
        } else {
          this.setState({ error: '' });
        }
      });
  }

  googleAuth() {
    Meteor.loginWithGoogle({},
      (err) => {
        if (err) {
          console.log(err);
          this.setState({ error: 'Unable to login with Google.' });
        } else {
          this.setState({ error: '' });
        }
      });
  }


  render() {
    const { error } = this.state;
    return (
      <div className="boxed-view">
        <Card>

          <Card.Content>
            <Card.Header>Log In</Card.Header>
          </Card.Content>

          <Card.Content>
            {error ? <p>{error}</p> : undefined}
            <Form noValidate onSubmit={this.onSubmit}>
              <Form.Field>
                <label>Email</label>
                <input type="email" ref={(e) => { this.email = e; }} placeholder="Email" />
              </Form.Field>

              <Form.Field>
                <label>Password</label>
                <input type="password" ref={(e) => { this.password = e; }} placeholder="Password" />
              </Form.Field>

              <Button type="submit">Log in</Button>

            </Form>
          </Card.Content>

          <Card.Content style={{ textAlign: 'center' }}>Or</Card.Content>

          <Card.Content style={{ textAlign: 'center' }}>
            <Button
              type="submit"
              onClick={() => this.ghAuth()}
              style={{ width: '100%' }}
            >
              <FaGithub
                size={32}
                style={{
                  marginRight: '8px',
                  marginLeft: '-8px',
                  verticalAlign: 'middle',
                }}
              />
              Log in with GitHub
            </Button>
            <Button
              type="submit"
              style={{ marginTop: '0.6rem', width: '100%' }}
              onClick={() => this.googleAuth()}
            >
              <FaGoogle
                size={32}
                style={{
                  marginRight: '8px',
                  marginLeft: '-8px',
                  verticalAlign: 'middle',
                }}
              />
              Log in with Google
            </Button>
          </Card.Content>

          <Card.Content>
            <Link to="/signup">Don't have an account?</Link>
          </Card.Content>

        </Card>
      </div>

    );
  }
}
