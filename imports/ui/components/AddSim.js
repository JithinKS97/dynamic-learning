import React from 'react'
import { Sims } from '../../api/sims'
import Modal from 'react-modal'
import { Meteor } from 'meteor/meteor'
import SimContainer from './SimContainer'
import { withTracker } from 'meteor/react-meteor-data'

class AddSim extends React.Component {

    /* This component is used for the selection of the simulation for
       the teachers to add to a slide. The simulations are fetched from 
       the database.

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
            sim:null
        }
        this.simsList.bind(this)
        this.showSim.bind(this)
    }

    simsList() {

        /* This is for displaying the simulations fetched. For each simulation, there
           will be a button with the name of the simulation in it. If the button is
           pressed, the correspoing simulation's data is set in the state, so
           that it is rendered. sim contains src, width, height and the name of the simulation.
        */

        if(this.props.sims) {
            return this.props.sims.map((sim)=>{
                
                return (
                    <div key = {sim._id}>
                        <button onClick = {()=>{

                            this.setState({sim})

                            }} key = {sim._id}>
                            {sim.name}
                        </button>
                    </div>
                )
            })
        }
    }

    showSim() {

        /* If there is a valid sim in the state, an iframe is rendered */

        if(this.state.sim) {
            return (
                <SimContainer isPreview = {true} {...this.state.sim}/>
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

                    /* The simulation is added only if the valid simulation is set to the
                       state.
                    */

                    if(this.state.sim) {

                        /* The slides and the current slides are obtained from the props
                           To the slides, the iframe of selected simulation is pushed and
                           the changes are saved by calling the saveChanges function.

                           See the definition of saveChanges funciton in CreateLessonPlan
                           Component.

                           Finally the Modal is closed after the insertion of the simulation.
                        */

                        const { slides, curSlide } = this.props

                        const toPush = {
                            src:this.state.sim.src,
                            w:this.state.sim.w,
                            h:this.state.sim.h,
                            x:0,
                            y:0,
                            data:{}
                        }

                        slides[curSlide].iframes.push(toPush)

                        this.props.saveChanges(slides)

                        this.setState({
                            isOpen:false,
                            sim:null
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
                            sim:null
                        }
                    )
                }}>Cancel</button>
            </Modal>
            </div>
        )
    }
}

export default AddSimContainer = withTracker(()=>{

    Meteor.subscribe('sims')
    
    const sims = Sims.find().fetch()

    return {
        sims
    }

})(AddSim)