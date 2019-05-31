/* eslint-disable import/prefer-default-export */
import { Route } from 'react-router-dom';
import React from 'react';

// eslint-disable-next-line react/prop-types
export const PublicRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (<Component {...props} />)}
  />
);
