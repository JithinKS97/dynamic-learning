import {Route, Redirect} from 'react-router-dom'
import React from 'react'
import {Meteor} from 'meteor/meteor'

export const PublicRoute = ({ component: Component, ...rest }) => (

 
    <Route {...rest} render={props =>
         (
            <Component {...props} />
        )
      }
    />
  );