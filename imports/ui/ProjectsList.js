import React from 'react';
import {Projects} from '../api/projects';
import { Tracker } from 'meteor/tracker';
import Lessonplan from './Lessonplan';


export default class ProjectsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            project_id:''
        };
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
                <p key = {project._id}>
                <button onClick = {()=>{
                    this.setState({
                        project_id:project._id
                    });
                }}>{project.name}</button>
                <button onClick = {()=>{
                    Projects.remove(project._id);
                }}>X</button>                
                </p>
            );
        });
    }

    render() {
        return(
            <div>
                <div>
                    {this.renderProjects()}
                </div>
                <div>
                    <Lessonplan project_id={this.state.project_id}/>
                </div>
            </div>
        );
    }
}