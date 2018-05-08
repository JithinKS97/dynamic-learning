import React from 'react';
import {Sims} from '../api/sims';
import { Tracker } from 'meteor/tracker';


export default class SimsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sims: [],
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

            const iframeResizerOptions = { checkOrigin: false };
            const src = sim.tag.match(`src\s*=\s*"\s*(.*)\s*">`)[1];
            return (
                  <iframe key={sim._id} src={src}></iframe>
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