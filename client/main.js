import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { AppRouter, onAuthChange } from '../imports/routes/AppRouter';
import '../imports/startup/simple-schema-configuration';

Tracker.autorun(() => {
  const isAuthenticated = !!Meteor.userId();
  onAuthChange(isAuthenticated);
});

Meteor.startup(() => {
  ReactDOM.render(AppRouter, document.getElementById('app'));
});
