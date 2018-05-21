import React from 'react'
import { Sims } from '../api/sims'
import { Tracker } from 'meteor/tracker'
import Modal from 'react-modal'
import {Meteor} from 'meteor/meteor'

export default class AddSim extends React.Component {

    /* This component is used for the selection of the simulation for
       the teachers. The simulations are fetched from the database.

       Here for prototyping, all the simulations are altogether fetched.
       But in the final version of the application, the simulations are
       not altogether fetched, but according the realtime search of the
       user.
    */

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

        /* Since we need to render the component each time there is a
           change in the Simulation collection, tracker autorun is used.
        */

        this.simTracker = Tracker.autorun(()=>{
            const sims = Sims.find().fetch()

            this.setState({
                sims
            })
        }) 
    } 


    componentWillUnmount(nextState) {
        this.simTracker.stop()
    }

    shouldComponentUpdate(nextState) {

        /*To avoid the unnecessary re-rendering*/

        if(this.state.src === nextState.src)
            return false
        else
            return true
    }

    simsList() {

        /* This is for displaying the simulations fetched. For each simulation, there
           will be a button with the name of the simulation in it. If the button is 
           pressed, the correspoing simulation's iframe src is set in the state, so 
           that it is rendered.
        */

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

        /* If there is an src in the state, an iframe is rendered */

        if(this.state.src) {
            return (
                <div>
                    <iframe src = {this.state.src}></iframe>
                </div>
            )
        }
    }

    render() {

        /* Simulation adding feature will be a modal that will be opened when the Add sim button
           is pressed. The simulations are shown by the simsList() and the 
           selected simulation is shown by the showSim().
        */

        return(
            <div>
            <button onClick = {()=>this.setState({isOpen:true})}>Add sim</button>
            <Modal isOpen = {this.state.isOpen} ariaHideApp={false}>
                <h1>Select simulation</h1>

                {this.simsList()}
                {this.showSim()}
                
                <button onClick = {()=>{

                    /* The simulation is added only if the input field is not empty.
                       That is state.src will take upon a value only if the input
                       field is not empty.
                    */

                    if(this.state.src) {

                        /* The slides and the current slides are obtained from the props
                           To the slides, the iframe of selected simulation is pushed and 
                           the changes are saved by calling the saveChanges function.

                           See the definition of saveChanges funciton in CreateLessonPlan
                           Component.

                           Finally the Modal is closed after the insertion of the simulation.
                        */

                        const { slides, currSlide } = this.props

                        const sim = {
                            src: this.state.src,
                            x: 0,
                            y: 0,
                            w: 640,
                            h: 360
                        }

                        slides[currSlide].iframes.push(sim)
                        this.props.saveChanges(slides)

                        this.setState({
                            isOpen:false,
                            src:''
                        })
                    }

                    }}>Add
                </button>               

                <button onClick = {()=>{

                    /* The Modal opening and closing is determined by the isOpen in 
                       the state.
                    */

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