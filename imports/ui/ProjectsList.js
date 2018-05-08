import React from 'react';
import {Projects} from '../api/projects';
import { Tracker } from 'meteor/tracker';
import LessonPlan from './LessonPlan';
import {Lessonplans} from '../api/lessonplans';


export default class ProjectsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            selectedProject:''
        };
        this.deleteLessons.bind(this);
    }
    
    componentDidMount() {
        this.projectsTracker =Tracker.autorun(()=>{
            const projects = Projects.find().fetch();
            this.setState({projects});
        });        
    }

    componentWillUnmount() {
        this.projectsTracker.stop();        
    }

    renderProjects() {
        
        return this.state.projects.map((project) => {
            return (
                <div key = {project._id}>
                <button onClick = {()=>{
                    this.setState(
                        {
                            selectedProject:project._id
                        }                        
                    );
                }}>{project.name}</button>
                <button onClick = {()=>{                    
                    Projects.remove(project._id);
                    this.deleteLessons(project._id);
                }}>X</button>                
                </div>
            );
        });
    }

    deleteLessons(project_id){
        const lessons = Lessonplans.find().fetch();
        lessons.map((lesson)=>{
            if(lesson.project_id == project_id)
            {
                Lessonplans.remove(lesson._id);
            }
        });
    }
    
    render() {
        return(
            <div>
                {this.renderProjects()}
                <LessonPlan selectedProject={this.state.selectedProject}/>
            </div>
        );
    }
}