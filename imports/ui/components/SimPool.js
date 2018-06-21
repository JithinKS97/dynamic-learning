import React from 'react'
import { Sims } from '../../api/sims'
import { List, Input } from 'semantic-ui-react' 
 
export default class SimPool extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            sims:[]
        }
        this.displaySims.bind(this)
    }

    componentDidMount() {

        Meteor.subscribe('sims.public')
        Tracker.autorun(()=>{

            const sims = Sims.find({isPublic:true}).fetch()
            this.setState({
                sims,
                selectedSim:null
            })

            
        })
    }

    displaySims() {

        const {sims} = this.state

        return sims.map((sim, index) =>{
            return (
                <List.Item key = {index} onClick = {()=>{
                    this.setState({                        
                        selectedSim: sim
                    },()=>{
                        this.props.getNode(sim)
                    })
                }}>
                    <List.Content>    
                        {sim.name}
                    </List.Content>
                </List.Item>
            )
        })

    }

    render() {

        return(
            <List selection verticalAlign='middle'>
                {this.displaySims()}
            </List>
        )
    }
}