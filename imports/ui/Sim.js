import React from 'react';
import {Sims} from '../api/sims';
import SimsList from './SimsList';

export default class Sim extends React.Component {

    handleSubmit(e) {
        e.preventDefault();
        const code = this.refs.code.value.trim();
        if(code) {
            Sims.insert({code});
            this.refs.code.value = '';
        }
    }

    render() {
        return(
        <div>
            <form onSubmit={this.handleSubmit.bind(this)}>
            <textarea cols='30' rows='25'  name='code' ref='code' placeholder='Code'/>
            <button>Submit</button>
            </form>
            <SimsList/>
        </div>
        );
    }
}