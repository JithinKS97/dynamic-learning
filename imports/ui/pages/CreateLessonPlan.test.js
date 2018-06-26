import { Meteor } from 'meteor/meteor'
import React from'react'
import { mount } from 'enzyme'
import { Router, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history';

if(Meteor.isClient) {

import CreateLessonPlan from './CreateLessonPlan'
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

    describe('CreateLessonPlan', function() {
        
        it('should pass', function() {

            const wrapper = mount (

                <Router history={createMemoryHistory()}>
                    <Route path="/" component={CreateLessonPlan}/>
                 </Router>
            )
        })

    })

}