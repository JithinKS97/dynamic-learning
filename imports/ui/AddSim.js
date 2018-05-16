import React from 'react'
import { Sims } from '../api/sims'
import { Tracker } from 'meteor/tracker'
import Modal from 'react-modal'
import {Meteor} from 'meteor/meteor'

export default class AddSim extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sims: [],
            isOpen: false,
            src:''
        }
        this.simsList.bind(this)
        this.showSim.bind(this)
    }

    componentDidMount() {

        Meteor.subscribe('sims')

        this.simTracker = Tracker.autorun(()=>{
            const sims = Sims.find().fetch()
            this.setState({
                sims
            })
        }) 
    } 


    componentWillUnmount() {
        this.simTracker.stop()
    }

    simsList() {
        if(this.state.sims) {
            return this.state.sims.map((sim)=>{
                return (
                    <div key = {sim._id}>
                        <button onClick = {()=>{this.setState({src:sim.iframe})}} key = {sim._id}>
                            {sim.name}
                        </button>                     
                    </div>
                )
            })
        }
    }

    showSim() {
        if(this.state.src) {
            return (
                <div>
                    <iframe src = {this.state.src}></iframe>
                </div>
            )
        }
    }

    render() {

        return(
            <div>
            <button onClick = {()=>this.setState({isOpen:true})}>Add sim</button>
            <Modal isOpen = {this.state.isOpen} ariaHideApp={false}>
                <h1>Select simulation</h1>
                {this.simsList()}
                {this.showSim()}
                <button onClick = {()=>{

                    const slides = this.props.slides
                    const currSlide = this.props.currSlide

                    slides[currSlide].iframes.push(this.state.src)
                    this.props.saveChanges(slides)

                    this.setState({
                        isOpen:false
                    })

                }}>Add</button>
                <button onClick = {()=>{
                    this.setState( {
                            isOpen:false,
                            src:''
                        }
                    )
                }}>Cancel</button>
            </Modal>
            </div>
        )
    }
}