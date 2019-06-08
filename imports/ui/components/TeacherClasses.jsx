import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Button, Form } from 'semantic-ui-react';
import { Classes } from '../../api/classes';

export default class TeacherClasses extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      classes: [],
    };
  }

  componentDidMount() {
    Meteor.subscribe('getAccounts');
    Meteor.subscribe('classes');

    Tracker.autorun(() => {
      if (Meteor.user()) {
        this.setState({
          user: Meteor.user().username,
        });
      }
      if (Meteor.user() && Meteor.user().classes) {
        this.setState({
          classes: Meteor.user().classes,
        });
      } else {
        this.setState({
          classes: [],
        });
      }
    });
  }


  randomClassCode = () => Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5)

  // this function can ONLY be called by a teacher, will allow a new class to be created
  createClass = () => {
    if (this.classname.value && this.classname.value !== '') {
      const code = this.randomClassCode();
      this.state.classes.push(code);
      Meteor.call('classes.insert', code, this.classname.value, this.state.user);
    }
  }

  getClasses = () => {
    const user = Meteor.users.find({ username: this.state.user }).fetch()[0];
    const clnames = [];
    if (user.classes) {
      user.classes.map((c) => {
        const cl = Classes.find({ classcode: c }).fetch()[0];
        return clnames.push(cl);
      });
    }
    return clnames;
  }

  render() {
    return (
      <div>
        <Form style={{ marginTop: '1.2rem', width: '25%' }} noValidate onSubmit={() => this.createClass()}>
          <Form.Field>
            <input ref={e => this.classname = e} placeholder="Name of new class" />
          </Form.Field>
          <Button type="submit"> Add new class </Button>
        </Form>
        <div style={{ marginTop: '1.2rem' }}>
          <b> Your current classes </b>
        </div>
        {this.state.user !== '' && this.getClasses().map(cl => (
          <div style={{ paddingTop: '0.4rem' }}>
            {' '}
            {`${cl.name}: ${cl.classcode}`}
            {' '}
          </div>
        ))}
      </div>
    );
  }
}
