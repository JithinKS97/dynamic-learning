import {Route, Redirect} from 'react-router-dom'
import React from 'react'
import {Meteor} from 'meteor/meteor'

export const PublicRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props =>
        Meteor.userId() ? (
          <Redirect
            to={{
              pathname: "/lessonplans",
              state: { from: props.location }
            }}
          />
        ) : (
            <Component {...props} />
        )
      }
    />
  );