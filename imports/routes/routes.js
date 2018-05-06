import { Router, Route, browserHistory} from 'react-router';
import Root from '../ui/Root';
import React from 'react';
import Drawingboard from '../ui/Drawingboard';
import Upload from '../ui/Upload';
import Sim from '../ui/Sim';

export const routes = (
    <Router history={browserHistory}>
        <Route path='/' component={Root}></Route>
        <Route path='/drawingboard' component={Drawingboard}></Route>
        <Route path='/upload' component={Upload}></Route>
        <Route path='/sim' component={Sim}></Route>
    </Router>
);