/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import RequestsList from '../components/sharingList/RequestsList';
import history from '../../routes/history';


const HelpMakeSimulations = () => (
  <div style={{ height: '100vh' }}>
    <BackButton />
    <div style={{ height: '20vh', textAlign: 'center' }}>
      <img
        className="login__logo"
        src="/symbol.png"
      />
    </div>
    <div
      className="lighter-grey-background"
      style={{
        height: '80vh', width: '60vw', margin: 'auto',
      }}
    >
      <RequestsList />
    </div>
  </div>
);

const BackButton = () => (
  <div onClick={() => history.goBack()} className="sharedResources__back-button">
    <FaArrowLeft color="#3e3e3e" size="1rem" />
  </div>
);

export default HelpMakeSimulations;
