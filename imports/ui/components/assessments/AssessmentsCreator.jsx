/*eslint-disable*/
import React from 'react';
import {
  Button,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import Tests from '../../../api/assessments';
import Questions from '../../../api/questions';

export default class AssessmentsCreator extends React.Component {

  componentDidMount() {
    Meteor.subscribe('assessments');
    Meteor.subscribe('questions');

    Tracker.autorun(() => {

    });
  }

  finishEditing = () => {
    const { done } = this.props;
    done();
  }

  render() {
    const { title } = this.props;
    return (
      <div>
        <div>
          {' '}
          {title}
          {' '}
        </div>
        <Button onClick={() => this.finishEditing()}> Done </Button>
      </div>
    );
  }
}
