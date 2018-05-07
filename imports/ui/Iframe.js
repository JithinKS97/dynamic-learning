import React from 'react';
import {Iframes} from '../api/iframes';
import SimsList from './SimsList';

export default class Iframe extends React.Component {

    handleSubmit(e) {
        e.preventDefault();
        const tag = this.refs.iframe.value;
        Iframes.insert({tag:tag});
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