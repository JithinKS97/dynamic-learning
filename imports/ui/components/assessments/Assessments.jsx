/* eslint-disable react/jsx-indent */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable*/
import React from 'react';
import {
  Button,
  Modal,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import Tests from '../../../api/assessments';
import AssessmentsCreator from './AssessmentsCreator';

// import MathQuill, { addStyles as addMathquillStyles } from 'react-mathquill';
// addMathquillStyles();

export default class Assessments extends React.Component {
  constructor() {
    super();
    this.state = {
      maketitle: false,
      creating: false,
      error: false,
    };
    this.title = '';
  }

  componentDidMount() {
    Meteor.subscribe('assessments');
    Meteor.subscribe('questions');

    Tracker.autorun(() => {
      this.setState({ tests: Tests.find().fetch() });
    });
  }

  makeAssessment = () => {
    if (this.title.value === '') {
      this.setState({ error: true });
      return;
    }
    this.setState({ creating: true, maketitle: false, error: false });
    Meteor.call('assessments.insert', this.title.value);
  }

  makeTitle = () => {
    this.setState({ maketitle: true });
  }

  render() {
    const { tests, error, maketitle, creating } = this.state;
    return (
        <div style={{ textAlign: 'left' }}>
          {!creating && <Button onClick={() => this.makeTitle()}> Create new Assessment </Button>}
          {!creating && tests && tests.map(test => <div> {test.title} </div>)}
          <Modal open={maketitle} onClose={() => this.setState({ maketitle: false })}>
            <Modal.Header>
              Enter a title for your assessment.
              <Button className="close-button" onClick={() => this.setState({ maketitle: false })}>
                X
              </Button>
            </Modal.Header>
            <Modal.Description style={{ padding: '0.8rem' }}>
              <input ref={e => this.title = e} style={{ marginTop: '1rem', marginBottom: '1rem' }} />
              <br />
              <Button onClick={() => { this.makeAssessment(); }}> Create Assessment </Button>
              {error && <div style={{ color: 'red', paddingTop: '0.8rem' }}> Please enter a valid title </div> }
            </Modal.Description>
          </Modal>
          {creating && <AssessmentsCreator title={this.title && this.title.value} done={() => this.setState({ creating: false })} />}
          {/* Please enter your question here:
              <div
                style={{
                  marginTop: '3px',
                  color: 'black',
                  width: '60%',
                  borderWidth: '1px',
                  borderColor: 'black',
                  borderStyle: 'solid',
                  padding: '3px',
                }}
                contentEditable
                ref={e => this.content = e}
              >
                {this.content !== undefined && this.content.value}
              </div> */}
        </div>
    );
  }
}
