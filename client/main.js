import React from 'react';
import ReactDOM from 'react-dom';
import {Meteor} from 'meteor/meteor';
import {AppRouter, onAuthChange} from '../imports/routes/AppRouter';
import {LessonPlans} from '../imports/api/lessonplans'
import '../imports/startup/simple-schema-configuration.js'

Tracker.autorun(()=>{
  const isAuthenticated = !!Meteor.userId()
  onAuthChange(isAuthenticated)
})

Meteor.startup(()=>{
  ReactDOM.render(AppRouter, document.getElementById('app'));
});
