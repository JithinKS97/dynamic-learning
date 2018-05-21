import { Router, Route, Link, Switch } from 'react-router-dom'
import React from 'react'
import { Tracker } from 'meteor/tracker'
import { Redirect } from 'react-router-dom'
import createHistory from 'history/createBrowserHistory'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

import Login from '../ui/Login'
import CreateLessonPlan from '../ui/CreateLessonPlan'
import LessonPlans from '../ui/LessonPlans'
import Signup from '../ui/Signup'
import NotFound from '../ui/NotFound'
import UploadSim from '../ui/UploadSim'
import Request from '../ui/Request'
import SandBox from '../ui/SandBox'

const history = createHistory()
const unAuthenticatedPages = ['/', '/signup']
const authenticatedPages = ['/lessonplans', '/drawingboard','/createlessonplan','/simupload','/request','/sandbox']

export const onAuthChange = (isAuthenticated) => {
  const IsUnauthenticatedPage = unAuthenticatedPages.includes(location.pathname)
  const IsAuthenticatedPage = authenticatedPages.includes(location.pathname)
  
  if(IsUnauthenticatedPage && isAuthenticated) {
      history.replace('/lessonplans')
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
        <PrivateRoute path='/lessonplans' component = {LessonPlans}></PrivateRoute>
        <PrivateRoute path='/uploadsim' component = {UploadSim}></PrivateRoute>
        <PrivateRoute path='/request/:_id' component = {Request}></PrivateRoute>
        <PrivateRoute path='/sandbox' component = {SandBox}></PrivateRoute>
        <PrivateRoute path='/createlessonplan/:_id' component = {CreateLessonPlan}></PrivateRoute>
        <Route path = '*' component = {NotFound}></Route>
        </Switch>
        </div>
    </Router>
)