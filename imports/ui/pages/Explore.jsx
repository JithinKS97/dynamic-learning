/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Header } from 'semantic-ui-react';
import { FaBook, FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';
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
            style={{
              backgroundColor: '#F0F0F0', padding: '1rem', width: '25vw', height: '80vh',
            }}
          >
            <Header as="h3">
              <FaBook />
              {' '}
              Workbooks
            </Header>
            <SharedWorkbooks />
          </div>
          <div style={{ backgroundColor: '#F0F0F0', padding: '1rem', width: '25vw' }}>
            <Header as="h3">
              <FaChalkboardTeacher />
              {' '}
              Lessons
            </Header>
            <SharedLessons />
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
    <FaArrowLeft color="3e3e3e" size="1.2rem" />
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
