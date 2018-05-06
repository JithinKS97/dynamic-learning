import React from 'react';
import {Sims} from '../api/sims';
import SimsList from './SimsList';
import sketchToRun from '../api/sketchToRun';
import P5Wrapper from 'react-p5-wrapper';

export default class Sim extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            code:''
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const code = this.refs.code.value;
        this.setState({
            code
        });
    }

    render() {
        return(
        <div>
            <p>Sim create</p>
            <form onChange={this.handleSubmit.bind(this)}>
            <textarea cols='30' rows='25'  name='code' ref='code' placeholder='Code'/>
            </form>
            <P5Wrapper sketch={sketchToRun(this.state.code, 'hello')}/>
        </div>
        );
    }
}