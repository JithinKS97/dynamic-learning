import React from 'react'
import { Sims, SimsIndex } from '../../api/sims'
import { List, Input } from 'semantic-ui-react' 
 
export default class SimPool extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            sims:[],
            searchTag:null
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
                        {sim.title}
                    </List.Content>
                </List.Item>
            )
        })

    }

    search(event, data) {

        Tracker.autorun(()=>{
            this.setState({sims:SimsIndex.search(data.value).fetch()})
        })
        
    }

    render() {

        return(
            <div>
                <Input ref = {e => this.searchTag = e} onChange = {this.search.bind(this)} label = 'search'/>
                <List style = {{width:'100%', height:'100%'}}  selection verticalAlign='middle'>
                    {this.displaySims()}
                </List>
            </div>
        )
    }
}