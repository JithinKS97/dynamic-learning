import React from 'react';
import {Iframes} from '../api/iframes';
import { Tracker } from 'meteor/tracker';

export default class SimsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sims: []
        };
    }
    componentDidMount() {
        this.simsTracker =Tracker.autorun(()=>{
            const sims = Iframes.find().fetch();
            this.setState({sims});
        });
    }
    componentWillUnmount() {
    }

    renderSims() {
        return this.state.sims.map((sim) => {
            const src = sim.tag.match(`src\s*=\s*"\s*(.*)\s*">`)[1];
            console.log(src);
            console.log('hello');
            return (
                <div key={sim._id}>
                    <iframe src={src} style={{}}></iframe>
                </div>
            );
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