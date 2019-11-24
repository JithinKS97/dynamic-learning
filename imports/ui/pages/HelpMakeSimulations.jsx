/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import RequestsList from '../components/sharingList/RequestsList';

const HelpMakeSimulations = () => (
  <div style={{ height: '100vh' }}>
    <BackButton />
    <div style={{ height: '20vh', textAlign: 'center' }}>
      <img
        className="login__logo"
        src="/symbol.png"
      />
    </div>
    <div style={{
      height: '80vh', backgroundColor: '#F0F0F0', width: '60vw', margin: 'auto',
    }}
    >
      <RequestsList />
    </div>
  </div>
);

const BackButton = () => (
  <Link to="/explore">
    <div className="sharedResources__back-button">
      <FaArrowLeft color="black" size="1.2rem" />
    </div>
  </Link>
);

export default HelpMakeSimulations;
