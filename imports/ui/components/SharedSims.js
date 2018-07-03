import React from 'react'
import { SimsIndex } from '../../api/sims'
import { List, Input } from 'semantic-ui-react' 
 
export default class SharedSims extends React.Component {

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

        this.simsTracker = Tracker.autorun(()=>{

            this.setState({
                sims:SimsIndex.search('').fetch(),
                selectedSim:null
            })            
        })
    }

    componentWillUnmount() {

        this.simsTracker.stop()
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
                <List selection verticalAlign='middle'>
                    {this.displaySims()}
                </List>
            </div>
        )
    }
}