import React from 'react';
import { Tracker } from 'meteor/tracker';
import {Lessonplans} from '../api/lessonplans';
import Drawingboard from './Drawingboard';


export default class LessonPlansList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lessonplans: [],
            selectedLesson: ''
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
                    <button onClick ={()=>{
                        this.setState({
                            selectedLesson: lesson._id
                        },this.refs.Drawingboard.showNotes(lesson._id));

        
                    }}>{lesson.name}</button>
                    <button onClick = {()=>{
                        Lessonplans.remove(lesson._id);
                        this.setState({
                            selectedLesson: ''
                        });
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
                <Drawingboard ref = 'Drawingboard'/>
            </div>
        );
    }
}