import React from 'react';
import {Lessonplans} from '../api/lessonplans';
import LessonPlansList from './LessonPlansList';


export default class LessonPlan extends React.Component {

    handleSubmit(e) {
        e.preventDefault();
        const name = this.refs.lesson.value;
        const project_id = this.props.selectedProject
        if(name && project_id) {
            Lessonplans.insert({
                name,
                project_id
            });            
        }
        this.refs.lesson.value='';
    }

    render() {
        return (
            <div> 
                <form onSubmit ={this.handleSubmit.bind(this)}>
                <input ref='lesson'/>
                <button>Add Lesson</button>
                </form>
               <LessonPlansList selectedProject = {this.props.selectedProject}/>
            </div>
        );
    }
}