import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import {
  Button, Form, Modal,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Classes from '../../../api/classes';
import { Workbooks } from '../../../api/workbooks';


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
    Meteor.subscribe('workbooks');
    Meteor.subscribe('workbooks.public');

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


  randomClassCode = () => (
    Math.random()
      .toString(36)
      .substring(2, 5) + Math.random()
      .toString(36)
      .substring(2, 5)
  )

  // this function can ONLY be called by a teacher, will allow a new class to be created

  createClass = () => {
    const { classes, user } = this.state;

    if (this.classname.value && this.classname.value !== '') {
      const code = this.randomClassCode();
      classes.push(code);
      Meteor.call('classes.insert', code, this.classname.value, user);
      this.classname.value = '';
    }
  }

  getClasses = () => {
    const { user } = this.state;
    const _user = Meteor.users.find({ username: user }).fetch()[0];
    const clnames = [];
    if (_user.classes) {
      _user.classes.map((c) => {
        const cl = Classes.find({ classcode: c }).fetch()[0];
        return clnames.push(cl);
      });
    }
    return clnames;
  }

  handleClose = () => {
    this.setState({
      modalOpen: false,
    });
  }

  handleOpen = (classcode) => {
    this.setState({
      modalOpen: true,
      clickedclass: classcode,
    });
  }

  classmatelist = (clickedclass) => {
    const classmates = [];
    if (clickedclass) {
      const classObject = Classes.findOne({ classcode: clickedclass });
      if (classObject) {
        classObject.roster.map(
          student => classmates.push(student),
        );
      }
    }
    return classmates;
  }

  render() {
    const { user, modalOpen, clickedclass } = this.state;
    return (
      <div>
        <Form style={{ marginTop: '1.2rem', width: '25%' }} noValidate onSubmit={() => this.createClass()}>
          <Form.Field>
            <input ref={(e) => { this.classname = e; }} placeholder="Name of new class" />
          </Form.Field>
          <Button type="submit"> Add new class </Button>
        </Form>
        <div style={{ marginTop: '1.2rem' }}>
          <b> Your current classes </b>
        </div>
        {user !== '' && this.getClasses().map((cl) => {
          if (cl) {
            return (
              <div>
                <div style={{ display: 'flex', flexDirection: 'row', marginTop: '0.4rem' }}>
                  <div onClick={() => this.handleOpen(cl.classcode)}>
                    {' '}
                    {`${cl.name}: ${cl.classcode}`}
                    {' '}
                  </div>
                  <a
                    onClick={() => {
                      if (confirm('Are you sure you want to remove the class?')) {
                        Meteor.call('classes.remove', cl);
                      }
                    }}
                    style={{ marginLeft: '0.4rem', cursor: 'pointer' }}
                  >
                    X
                  </a>
                </div>
                <div style={{ paddingLeft: '1rem' }}>
                  {Classes.findOne({
                    classcode: cl.classcode,
                  }).lessons && Classes.findOne({ classcode: cl.classcode }).lessons.map(lesson => (
                    <div>
                      {' '}
                      <Link to={{ pathname: `/createworkbook/${lesson}`, state: { from: 'teacherclasses' } }}>
                        {' '}
                        {Meteor.user() && Workbooks
                          .findOne({ _id: lesson }) && Workbooks
                          .findOne({ _id: lesson }).title}
                        {' '}
                      </Link>
                      {' '}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        })}

        <Modal
          open={modalOpen}
          onClose={() => this.handleClose()}
          size="tiny"
        >
          <Modal.Header>
            Students in your class
            <Button className="close-button" onClick={() => this.handleClose()}>
              X
            </Button>
          </Modal.Header>

          <Modal.Content>
            <Modal.Description>
              {clickedclass && this.classmatelist(clickedclass).map(
                student => (
                  <div>
                    {' '}
                    {student}
                    {' '}
                  </div>
                ),
              )}
            </Modal.Description>

          </Modal.Content>

        </Modal>
      </div>
    );
  }
}
