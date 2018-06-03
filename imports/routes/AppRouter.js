import { Router, Route, Link, Switch } from 'react-router-dom'
import React from 'react'
import createHistory from 'history/createBrowserHistory'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

import Login from '../ui/pages/Login'
import CreateLessonPlan from '../ui/pages/CreateLessonPlan'
import LessonPlans from '../ui/pages/LessonPlans'
import Signup from '../ui/pages/Signup'
import NotFound from '../ui/pages/NotFound'
import UploadSim from '../ui/pages/UploadSim'
import Request from '../ui/pages/Request'
import SandBox from '../ui/pages/SandBox'
import Dashboard from '../ui/pages/Dashboard'
import Requests from '../ui/pages/Requests'


const history = createHistory()
const unAuthenticatedPages = ['/', '/signup']
const authenticatedPages = ['/lessonplans','/createlessonplan','/simupload','/request','/sandbox','/dashboard', 'requests']

export const onAuthChange = (isAuthenticated) => {
  const IsUnauthenticatedPage = unAuthenticatedPages.includes(location.pathname)
  const IsAuthenticatedPage = authenticatedPages.includes(location.pathname)
  
  if(IsUnauthenticatedPage && isAuthenticated) {
      history.replace('/dashboard')
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
                <PrivateRoute path='/requests' component = {Requests}></PrivateRoute>s
                <PrivateRoute path='/dashboard' component = {Dashboard}></PrivateRoute>
                <PrivateRoute path='/createlessonplan/:_id' component = {CreateLessonPlan}></PrivateRoute>
                <Route path = '*' component = {NotFound}></Route>
            </Switch>
        </div>
    </Router>
)