import React from 'react';
import { Grid, Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import SharedLessons from '../components/SharedLessons';
import SharedLessonPlans from '../components/SharedLessonPlans';
import RequestsList from '../components/RequestsList';

export default class Explore extends React.Component {
  constructor(props) {
    super(props);
    Meteor.subscribe('lessonplans.public');
    Meteor.subscribe('lessons.public');
  }

  render() {
    return (
      <div style={{ padding: '1.6rem' }}>
        <Link to="/">
          <Button>Back</Button>
        </Link>
        <Grid style={{ marginTop: '0.8rem' }} columns={3} divided>
          <Grid.Row style={{ height: '100vh', scrolling: 'no' }}>
            <Grid.Column>
              <Header as="h3">Lessonplans</Header>
              <p>Search for lessonplans or create your own</p>
              <Link to="/createlessonplan">
                <Button style={{ marginBottom: '1.6rem' }}>
                  Create a new Lessonplan
                </Button>
              </Link>
              <SharedLessonPlans />
            </Grid.Column>
            <Grid.Column>
              <Header as="h3">Lessons</Header>
              <SharedLessons />
            </Grid.Column>
            <Grid.Column>
              <Header as="h3">Help make simulations</Header>
              <RequestsList />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}
