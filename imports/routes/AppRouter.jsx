import { Router, Route, Switch } from 'react-router-dom';
import React from 'react';
import { createBrowserHistory } from 'history';

import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

import Login from '../ui/pages/Login';
import CreateLessonPlanContainer from '../ui/pages/CreateLessonPlan';
import Lesson from '../ui/pages/Lesson';
import LoadScreen from '../ui/pages/LoadScreen';
import Explore from '../ui/pages/Explore';

import Signup from '../ui/pages/Signup';
import NotFound from '../ui/pages/NotFound';

import Request from '../ui/pages/Request';
import SandBox from '../ui/pages/SandBox';
import Dashboard from '../ui/pages/Dashboard';


const history = createBrowserHistory();
const publicPages = ['/', '/signup', '/createlessonplan', '/login', '/explore'];
const authenticatedPages = [
  '/dashboard/lessonplans',
  '/dashboard/requests',
  '/dashboard/uploadsim',
  '/dashboard/lessons',
  '/dashboard/watchlesson',
  '/lesson',
  '/profile',
];

export const onAuthChange = (isAuthenticated) => {
  const isPublicPage = publicPages.includes(window.location.pathname);
  const isAuthenticatedPage = authenticatedPages.includes(window.location.pathname);

  if (isPublicPage && isAuthenticated) {
    history.replace('/dashboard/lessonplans');
  } else if (isAuthenticatedPage && !isAuthenticated) {
    history.replace('/');
  }
};

export const AppRouter = (
  <Router history={history}>
    <div>
      <Switch>
        <PublicRoute exact path="/" component={LoadScreen} />
        <PublicRoute exact path="/explore" component={Explore} />
        <PublicRoute exact path="/login" component={Login} />
        <PublicRoute path="/createlessonplan/:_id" component={CreateLessonPlanContainer} />
        <PublicRoute path="/lesson/:_id" component={Lesson} />
        <PublicRoute path="/createlessonplan" component={CreateLessonPlanContainer} />
        <PublicRoute path="/signup" component={Signup} />
        <PublicRoute path="/request/:_id" component={Request} />
        <PrivateRoute path="/sandbox" component={SandBox} />
        <PrivateRoute path="/dashboard/:option" component={Dashboard} />
        <Route path="*" component={NotFound} />
      </Switch>
    </div>
  </Router>
);
