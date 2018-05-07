import React from 'react';
import {Sims} from '../api/sims';
import SimsList from './SimsList';

export default class Add extends React.Component {

    handleSubmit(e) {
        e.preventDefault();
        const tag = this.refs.iframe.value;
        Sims.insert({tag:tag});
        this.refs.iframe.value = '';
    }
    render() {
        return(
            <div>
                <form onSubmit = {this.handleSubmit.bind(this)}>
                    <input ref='iframe'/>
                    <button>Add</button>
                </form>
                <SimsList/>
            </div>
        );
    }
}