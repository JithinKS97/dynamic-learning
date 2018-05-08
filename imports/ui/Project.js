import React from 'react';
import {Projects} from '../api/projects';
import ProjectsList from './ProjectsList';
import {Lessonplans} from '../api/lessonplans';


export default class Project extends React.Component {

    handleSubmit(e) {
        e.preventDefault();
        const name = this.refs.project.value;
        if(name) {
            Projects.insert({
                name
            });
        }
    }

    render() {
        return (
            <div>
            <form onSubmit={this.handleSubmit.bind(this)}>
                <input ref='project'/>
                <button>Create</button>
            </form>
            <ProjectsList/>
            </div>
        );
    }
}