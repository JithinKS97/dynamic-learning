/* eslint-disable import/prefer-default-export */
import { Route, Redirect } from 'react-router-dom';
import React from 'react';
import { Meteor } from 'meteor/meteor';

// eslint-disable-next-line react/prop-types
export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (Meteor.userId()) {
        return <Component {...props} />;
      }

      return (
        <Redirect
          to={{
            pathname: '/',
            state: { from: props.location }, // eslint-disable-line react/prop-types
          }}
        />
      );
    }}
  />
);
