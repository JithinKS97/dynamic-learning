/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/prop-types */
import React from 'react';

const HeaderWithLogo = ({ title }) => (
  <div className="header-with-logo__main">
    <img className="header-with-logo__logo" src="/symbol.png" />
    <h1 className="header-with-logo__header">{title}</h1>
  </div>
);

export default HeaderWithLogo;
