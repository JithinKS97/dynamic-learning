import React from 'react';
import { Tracker } from 'meteor/tracker';
import {
    Button
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { Meteor } from 'meteor/meteor';
import { Lessons } from '../../api/lessons';

export default class Votes extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userid: '',
            upvotes: [],
            downvotes: []
        };
    }

    componentDidMount() {
        Meteor.subscribe('lessons');
        Meteor.subscribe('lessons.public');

        Tracker.autorun(() => {
            if (Meteor.user()) {
                this.setState({
                    userid: Meteor.userId()
                });
            }
            if (this.props.lessonid) {
                this.setState({
                    upvotes: Lessons.findOne({ _id: this.props.lessonid }).upvotes,
                    downvotes: Lessons.findOne({ _id: this.props.lessonid }).downvotes
                });
            }
        });

    }

    upvote = () => {
        Meteor.call('lessons.upvote', this.props.lessonid, this.state.userid);
        this.setState({
            upvotes: Lessons.findOne({ _id: this.props.lessonid }).upvotes,
            downvotes: Lessons.findOne({ _id: this.props.lessonid }).downvotes
        });
    }

    downvote = () => {
        Meteor.call('lessons.downvote', this.props.lessonid, this.state.userid);
        this.setState({
            upvotes: Lessons.findOne({ _id: this.props.lessonid }).upvotes,
            downvotes: Lessons.findOne({ _id: this.props.lessonid }).downvotes
        });
    }

    upvoted = () => {
        const lesson = Lessons.findOne({_id: this.props.lessonid}); 
        if (lesson) {
            return lesson.upvotes.includes(this.state.userid) ? {backgroundColor: 'lightblue'} : {}; 
        }
        return {backgroundColor: 'gray'}; 
    }

    downvoted = () => {
        const lesson = Lessons.findOne({_id: this.props.lessonid}); 
        if (lesson) {
            return lesson.downvotes.includes(this.state.userid) ? {backgroundColor: 'lightblue'} : {}; 
        }
        return {backgroundColor: 'gray'}; 
    }

    numupvotes = () => {
        const lesson = Lessons.findOne({_id: this.props.lessonid}); 
        if (lesson) {
            return lesson.upvotes.length; 
        }
        return 0; 
    }

    numdownvotes = () => {
        const lesson = Lessons.findOne({_id: this.props.lessonid}); 
        if (lesson) {
            return lesson.downvotes.length; 
        }
        return 0; 
    }
    
    render() {
        return (
            <div style={{paddingBottom: '0.6rem'}}>
                <Button 
                    onClick={() => this.upvote()} 
                    style={this.upvoted()}
                >
                    Upvote ({this.numupvotes()})
                </Button>
                <Button 
                    onClick={() => this.downvote()} 
                    style={this.downvoted()}
                >
                    Downvote ({this.numdownvotes()})
                </Button>
            </div>
        );
    }
}