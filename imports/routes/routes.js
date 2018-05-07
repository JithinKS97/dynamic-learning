import { Router, Route, browserHistory} from 'react-router';
import Root from '../ui/Root';
import React from 'react';
import Drawingboard from '../ui/Drawingboard';
import Iframe from '../ui/Iframe';

export const routes = (
    <Router history={browserHistory}>
        <Route path='/' component={Root}></Route>
        <Route path='/drawingboard' component={Drawingboard}></Route>
        <Route path='/iframe' component={Iframe}></Route>
    </Router>
);