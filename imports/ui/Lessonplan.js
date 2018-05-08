import React from 'react';
import {Lessonplans} from '../api/lessonplans';


export default class Lessonplan extends React.Component {

    handleSubmit(e) {
        e.preventDefault();
        const name = this.refs.lesson.value;
        if(name) {
            Lessonplans.insert({
                name
            });            
        }
    }

    render() {
        return (
            <div> 
                <p>{this.props.project_id}</p>
                <form onSubmit ={this.handleSubmit.bind(this)}>
                <input ref='lesson'/>
                <button>Add Lesson</button>
                </form>
            </div>
        );
    }
}