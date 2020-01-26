/* eslint-disable*/
import { Meteor } from 'meteor/meteor'
import '../imports/api/users'
import { Workbooks } from '../imports/api/workbooks'
import { Requests } from '../imports/api/requests'
import { Sims } from '../imports/api/sims'
import { Lessons } from '../imports/api/lessons'
import { Classes } from '../imports/api/classes'
import { Comments } from '../imports/api/comments'
import { Tests } from '../imports/api/assessments'; 
import { Questions } from '../imports/api/questions';
import '../imports/startup/simple-schema-configuration.js'

// the code below is to apply a fix to the users and lessons that already existed

Lessons.find().fetch().map(lesson => {
    if (!lesson.upvotes || !lesson.downvotes) {
        Meteor.call('lessons.addupdown', lesson._id); 
    }
})

Meteor.users.find().fetch().map(user => {
    if (user.services) {
        if (user.services.github) {
            Meteor.call('setUsername', user._id, user.services.github.username); 
        }
        else if (user.services.google) {
            Meteor.call('setUsername', user._id, user.services.google.email);
        }
    }
})

if(Meteor.isServer){
    process.env.MAIL_URL = 'smtp://postmaster@sandboxxxxxxx.mailgun.org:xxxxxxxxxx@smtp.mailgun.org:587';
}
