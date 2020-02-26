import { Router, Route, Switch } from 'react-router-dom';
import React from 'react';

import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

import Login from '../ui/pages/Login';
import ForgotPassword from '../ui/pages/ForgotPassword';
import ResetPassword from '../ui/pages/ResetPassword';
import workbookeditorContainer from '../ui/pages/WorkbookEditor/WorkbookEditor';
import Lesson from '../ui/pages/Lesson';
import LoadScreen from '../ui/pages/LoadScreen';
import Explore from '../ui/pages/Explore';
import Signup from '../ui/pages/Signup';
import NotFound from '../ui/pages/NotFound';

// eslint-disable-next-line import/no-named-as-default
import Request from '../ui/pages/Request';
import SandBox from '../ui/pages/SandBox';
import Dashboard from '../ui/pages/Dashboard';
import About from '../ui/pages/About';
import HelpMakeSimulations from '../ui/pages/HelpMakeSimulations';

import history from './history';

const publicPages = [
  '/', 
  '/signup', 
  '/workbookeditor', 
  '/login', 
  '/explore', 
  '/help-make-simulations',
  '/forgotpassword',
  '/resetpassword'
];
const authenticatedPages = [
  '/dashboard/workbooks',
  '/dashboard/requests',
  '/dashboard/uploadsim',
  '/dashboard/lessons',
  '/dashboard/watchlesson',
  '/lesson',
  '/dashboard/profile',
  '/dashboard/classes',
  '/dashboard/assessments',
];

export const onAuthChange = (isAuthenticated) => {
  const isPublicPage = publicPages.includes(window.location.pathname);
  const isAuthenticatedPage = authenticatedPages.includes(window.location.pathname);

  if (isPublicPage && isAuthenticated) {
    history.replace('/dashboard/workbooks');
  } else if (isAuthenticatedPage && !isAuthenticated) {
    history.replace('/');
  }
};

export const AppRouter = (
  <Router history={history}>
    <Switch>
      <PublicRoute exact path="/" component={LoadScreen} />
      <PublicRoute exact path="/about" component={About} />
      <PublicRoute exact path="/explore" component={Explore} />
      <PublicRoute exact path="/login" component={Login} />
      <PublicRoute exact path="/forgotpassword" component={ForgotPassword} />
      <PublicRoute exact path="/resetpassword/:_id" component={ResetPassword} />
      <PublicRoute path="/workbookeditor/:_id" component={workbookeditorContainer} />
      <PublicRoute path="/lesson/:_id" component={Lesson} />
      <PublicRoute path="/workbookeditor" component={workbookeditorContainer} />
      <PublicRoute path="/signup" component={Signup} />
      <PublicRoute path="/request/:_id" component={Request} />
      <PublicRoute path="/help-make-simulations" component={HelpMakeSimulations} />
      <PrivateRoute path="/sandbox" component={SandBox} />
      <PrivateRoute path="/dashboard/:option" component={Dashboard} />
      <Route path="*" component={NotFound} />
    </Switch>
  </Router>
);
