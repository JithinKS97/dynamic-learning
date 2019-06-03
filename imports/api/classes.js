import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Requests } from "./requests";
import SimpleSchema from "simpl-schema";
import moment from "moment";
import { Index, MongoDBEngine } from "meteor/easy:search";

export const Classes = new Mongo.Collection('classes');

if (Meteor.isServer) {
    Meteor.publish("classes", function () {
        return Classes.find();
    });
}

Meteor.methods({
    'classes.insert'(classcode, name, instructor) {
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Classes.insert({
            classcode: classcode,
            name: name,
            instructor: instructor,
            roster: []
        })
        Meteor.call('addClass', instructor, classcode);
    },

    'classes.addstudent'(classcode, studentname) {
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Classes.update(
            { classcode: classcode },
            { $push: { roster: studentname } }
        )
        Meteor.call('addClass', studentname, classcode);
    },

    /*
    'classes.remove'() {
        return Classes.remove({}); 
    }
    */ 
   
})