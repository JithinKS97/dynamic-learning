import React from 'react';
import { Sims } from '../api/sims';
import { Tracker } from 'meteor/tracker';
import sketchToRun from '../api/sketchToRun';
import P5Wrapper from 'react-p5-wrapper';

export default class SimsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sims: []
        };
    }
    componentDidMount() {
        this.simsTracker =Tracker.autorun(()=>{
            const sims = Sims.find().fetch();
            this.setState({sims});
        });
    }
    componentWillUnmount() {
        this.simsTracker.stop();
    }

    renderSims() {
        return this.state.sims.map((sim) => {
            return <P5Wrapper key={sim._id} sketch={sketchToRun(sim.code,sim._id)} />
        });
    }

    render() {
        return(
            <div>
                {this.renderSims()}
            </div>
        );
    }
}