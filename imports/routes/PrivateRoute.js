import {Route, Redirect} from 'react-router-dom'
import React from 'react'
import {Meteor} from 'meteor/meteor'

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props =>
        Meteor.userId() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );