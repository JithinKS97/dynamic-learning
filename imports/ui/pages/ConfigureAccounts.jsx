/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import history from '../../routes/history';

export default class ConfigureAccounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
    };
    this.accountType = 'Teacher';
  }

  onSubmit = (e) => {
    e.preventDefault();

    const username = this.username.value.trim();
    const accountType = this.accountType.trim();

    if (!username) {
      this.setState({
        error: 'Username cannot be blank',
      });
      return;
    }


    // check if username already Exists
    Meteor.call('getUserId', username, (_err, usrId) => {
      if (usrId) {
        this.setState({
          error: 'Username already Exists',
        });
      } else {
        const user = Meteor.user();

        Meteor.call('setUsername', user._id, username);
        Meteor.call('updateType', user._id, accountType);
        history.replace('/dashboard/workbooks');
      }
    });
  };

  render() {
    const options = ['Teacher', 'Student', 'Standard'];
    const { error } = this.state;
    return (
      <div className="login__main">
        <div className="login-box">
          <img
            className="login__logo"
            src="/symbol.png"
          />
          {error ? <p>{error}</p> : undefined}

          <form noValidate onSubmit={this.onSubmit}>

            <div style={{
              float: 'left',
              marginBottom: '1rem',
              marginTop: '2rem',
              marginLeft: '1rem',
              color: 'grey',
              fontSize: '1.3rem',
              display: 'block',
            }}
            >
                            Just one more step!

            </div>

            <input
              className="login__input"
              ref={(e) => {
                this.username = e;
              }}
              placeholder="Username"
            />


            <select
              onChange={(e) => {
                this.accountType = e.target.value;
              }}
              className="login__input"
              style={{ backgroundColor: 'white', cursor: 'pointer', color: 'grey' }}
            >
              {options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button className="login__button">Sign up</button>

          </form>
        </div>
      </div>
    );
  }
}
