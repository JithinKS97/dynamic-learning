import { Router, Route, Link, Switch } from 'react-router-dom'
import React from 'react'
import { Tracker } from 'meteor/tracker'
import { Redirect } from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

import Login from '../ui/Login'
import CreateLessonPlan from '../ui/CreateLessonPlan'
import LessonPlan from '../ui/LessonPlan'
import Signup from '../ui/Signup'
import NotFound from '../ui/NotFound'

const history = createHistory()
const unAuthenticatedPages = ['/', '/signup']
const authenticatedPages = ['/lessonplan', '/drawingboard','/createlessonplan']

export const onAuthChange = (isAuthenticated) => {
  const IsUnauthenticatedPage = unAuthenticatedPages.includes(location.pathname)
  const IsAuthenticatedPage = authenticatedPages.includes(location.pathname)
  
  if(IsUnauthenticatedPage && isAuthenticated) {
      history.replace('/lessonplan')
  } else if(IsAuthenticatedPage && !isAuthenticated) {
      history.replace('/')
  }
}

export const AppRouter = (
    <Router history={history}>
        <div>
        <Switch>
        <PublicRoute exact path='/' component = {Login}></PublicRoute>
        <PublicRoute path='/signup' component = {Signup}></PublicRoute>
        <PrivateRoute path='/lessonplan' component = {LessonPlan}></PrivateRoute>
        <PrivateRoute path='/createlessonplan' component = {CreateLessonPlan}></PrivateRoute>
        <Route path = '*' component = {NotFound}></Route>
        </Switch>
        </div>
    </Router>
)