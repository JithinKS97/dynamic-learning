/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Header } from 'semantic-ui-react';
import { Icon } from 'react-icons-kit';
import { book } from 'react-icons-kit/fa/book';
import { arrowLeft } from 'react-icons-kit/fa/arrowLeft';
import { toggleRight } from 'react-icons-kit/fa/toggleRight';
import { Link } from 'react-router-dom';
import SharedLessons from '../components/sharingList/SharedLessons';
import SharedWorkbooks from '../components/sharingList/SharedWorkbooks';
import history from '../../routes/history';

export default class Explore extends React.Component {
  constructor(props) {
    super(props);
    Meteor.subscribe('workbooks.public');
    Meteor.subscribe('lessons.public');
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <BackButton />
        <HelpMakeSimulationsButton />
        <TitleBar />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          width: '100vw',
        }}
        >
          <div
            className="lighter-grey-background"
            style={{
              padding: '1rem', width: '25vw', height: '80vh', paddingRight: 0,
            }}
          >
            <Header as="h3">
              <Icon icon={book} />
              {' '}
              Workbooks
            </Header>
            <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
              <SharedWorkbooks />
            </div>
          </div>
          <div
            className="lighter-grey-background"
            style={{ padding: '1rem', width: '25vw' }}
          >
            <Header as="h3">
              <Icon icon={toggleRight} />
              {' '}
              Lessons
            </Header>
            <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
              <SharedLessons />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const TitleBar = () => (
  <div style={{ textAlign: 'center', height: '20vh' }}>
    <img
      className="login__logo"
      src="/symbol.png"
    />
  </div>
);

const BackButton = () => (
  <div onClick={() => history.goBack()} className="sharedResources__back-button">
    <Icon icon={arrowLeft} color="3e3e3e" size="1.2rem" />
  </div>
);

// eslint-disable-next-line react/prop-types
const HelpMakeSimulationsButton = () => (
  <Link to="/help-make-simulations">
    <div className="sharedResources__help-button">
      Help make simulations
    </div>
  </Link>
);
