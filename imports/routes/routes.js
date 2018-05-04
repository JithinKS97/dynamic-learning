import { Router, Route, browserHistory} from 'react-router';
import Sim from '../ui/Sim';
import Root from '../ui/Root';
import React from 'react';

export const routes = (
    <Router history={browserHistory}>
        <Route path='/sim' component={Sim}></Route>
        <Route path='/' component={Root}></Route>
    </Router>
);