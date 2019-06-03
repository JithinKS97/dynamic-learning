import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Requests } from "./requests";
import SimpleSchema from "simpl-schema";
import moment from "moment";
import { Index, MongoDBEngine } from "meteor/easy:search";

export const Classes = new Mongo.Collection('classes'); 

Meteor.methods({
    'classes.insert'(classcode, name) {
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        return Classes.insert({
            classcode: classcode, 
            name: name, 
            roster: []
        })
    },

    'classes.addstudent'(classcode, studentid) {
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        return Classes.update(
            {classcode: classcode}, 
            {$push : {roster: studentid}}
        )
    }
    
})