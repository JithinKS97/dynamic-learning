import { Router, Route, Link, Switch } from 'react-router-dom'
import React from 'react'
import createHistory from 'history/createBrowserHistory'

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

import Login from '../ui/pages/Login'
import CreateLessonPlan from '../ui/pages/CreateLessonPlan'
import CreateLesson from '../ui/pages/CreateLesson'
import LoadScreen from '../ui/pages/LoadScreen'

import Signup from '../ui/pages/Signup'
import NotFound from '../ui/pages/NotFound'

import Request from '../ui/pages/Request'
import SandBox from '../ui/pages/SandBox'
import Dashboard from '../ui/pages/Dashboard'


const history = createHistory()
const unAuthenticatedPages = ['/', '/signup', '/createlessonplan','/login']
const authenticatedPages = [
    '/lessonplans',
    '/simupload',
    '/request',
    '/sandbox',
    '/dashboard/lessonplans',
    '/dashboard/requests',
    '/dashboard/uploadsim',
    '/dashboard/lessons',
    '/createlesson'
]

export const onAuthChange = (isAuthenticated) => {


  const IsUnauthenticatedPage = unAuthenticatedPages.includes(location.pathname)
  const IsAuthenticatedPage = authenticatedPages.includes(location.pathname)

  if(IsUnauthenticatedPage && isAuthenticated) {
    history.replace('/dashboard/lessonplans')
  } else if(IsAuthenticatedPage && !isAuthenticated) {
    history.replace('/')
  }
}

export const AppRouter = (
    <Router history={history}>
        <div>
            <Switch>
                <PublicRoute exact path='/' component = {LoadScreen}></PublicRoute>
                <PublicRoute exact path='/login' component = {Login}></PublicRoute>
                <PrivateRoute path='/createlessonplan/:_id' component = {CreateLessonPlan}></PrivateRoute>
                <PrivateRoute path='/createlesson/:_id' component = {CreateLesson}></PrivateRoute>
                <PublicRoute path='/createlessonplan' component = {CreateLessonPlan}></PublicRoute>
                <PublicRoute path='/signup' component = {Signup}></PublicRoute>
                <PrivateRoute path='/request/:_id' component = {Request}></PrivateRoute>
                <PrivateRoute path='/sandbox' component = {SandBox}></PrivateRoute>
                <PrivateRoute path='/dashboard/:option' component = {Dashboard}></PrivateRoute>
                <Route path = '*' component = {NotFound}></Route>
            </Switch>
        </div>
    </Router>
)
