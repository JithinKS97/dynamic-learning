import React from 'react';
import { Grid, Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import FaBook from 'react-icons/lib/fa/book';
import FaPlayCircle from 'react-icons/lib/fa/play-circle';
import FaCode from 'react-icons/lib/fa/code';
import SharedLessons from '../components/SharedLessons';
import SharedWorkbooks from '../components/SharedWorkbooks';
import RequestsList from '../components/RequestsList';

export default class Explore extends React.Component {
  constructor(props) {
    super(props);
    Meteor.subscribe('workbooks.public');
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
              <Header as="h3">
                <FaBook />
                {' '}
                Workbooks
              </Header>
              <SharedWorkbooks />
            </Grid.Column>
            <Grid.Column>
              <Header as="h3">
                <FaPlayCircle />
                {' '}
                Lessons
              </Header>
              <SharedLessons />
            </Grid.Column>
            <Grid.Column>
              <Header as="h3">
                <FaCode />
                {' '}
                Help make simulations
              </Header>
              <RequestsList />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}
