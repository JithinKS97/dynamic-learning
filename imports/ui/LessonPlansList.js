import React from 'react';
import { Tracker } from 'meteor/tracker';
import {Lessonplans} from '../api/lessonplans';


export default class LessonPlansList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lessonplans: []
        };
        this.renderLessons.bind(this);
    }
    componentDidMount() {
        this.lessonPlansTracker =Tracker.autorun(()=>{
            const lessonplans = Lessonplans.find().fetch();
            this.setState({
                lessonplans
            });
        });    
    }
    componentWillUnmount() {
        this.lessonPlansTracker.stop();        
    }

    renderLessons() {

       return this.state.lessonplans.map((lesson)=>{
        if(lesson.project_id == this.props.selectedProject)
        {
            return (
                <div key={lesson._id}>
                    <button>{lesson.name}</button>
                    <button onClick = {()=>{
                        Lessonplans.remove(lesson._id);
                    }}>X</button>
                </div>
            );
        }
       });        
    }

    render() {

        return(
            <div>
                {this.renderLessons()}
            </div>
        );
    }
}