import { Router, Route, Switch } from 'react-router-dom'
import React from 'react'
import { createBrowserHistory } from 'history';

import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PublicRoute'

import Login from '../ui/pages/Login'
import CreateLessonPlan from '../ui/pages/CreateLessonPlan'
import Lesson from '../ui/pages/Lesson'
import LoadScreen from '../ui/pages/LoadScreen'
import Explore from '../ui/pages/Explore'


import Signup from '../ui/pages/Signup'
import NotFound from '../ui/pages/NotFound'
import Request from '../ui/pages/Request'
import SandBox from '../ui/pages/SandBox'
import Dashboard from '../ui/pages/Dashboard'


const history = createBrowserHistory()
const publicPages = ['/', '/signup', '/createlessonplan','/login', '/explore']
const authenticatedPages = [

    '/dashboard/lessonplans',
    '/dashboard/requests',
    '/dashboard/uploadsim',
    '/dashboard/lessons',
    '/dashboard/watchlesson',
    '/dashboard/profile', 
    '/lesson',
]

export const onAuthChange = (isAuthenticated) => {


  const IsPublicPage = publicPages.includes(location.pathname)
  const IsAuthenticatedPage = authenticatedPages.includes(location.pathname)

  if(IsPublicPage && isAuthenticated) {
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
                <PublicRoute exact path='/explore' component = {Explore}></PublicRoute>
                <PublicRoute exact path='/login' component = {Login}></PublicRoute>
                <PublicRoute path='/createlessonplan/:_id' component = {CreateLessonPlan}></PublicRoute>
                <PublicRoute path='/lesson/:_id' component = {Lesson}></PublicRoute>
                <PublicRoute path='/createlessonplan' component = {CreateLessonPlan}></PublicRoute>
                <PublicRoute path='/signup' component = {Signup}></PublicRoute>
                <PublicRoute path='/request/:_id' component = {Request}></PublicRoute>
                <PrivateRoute path='/sandbox' component = {SandBox}></PrivateRoute>
                <PrivateRoute path='/dashboard/:option' component = {Dashboard}></PrivateRoute>
                <Route path = '*' component = {NotFound}></Route>
            </Switch>
        </div>
    </Router>
)
