import { Router, Route, browserHistory} from 'react-router';
import Root from '../ui/Root';
import React from 'react';
import Drawingboard from '../ui/Drawingboard';
import Add from '../ui/Add';

export const routes = (
    <Router history={browserHistory}>
        <Route path='/' component={Root}></Route>
        <Route path='/drawingboard' component={Drawingboard}></Route>
        <Route path='/add' component={Add}></Route>
    </Router>
);