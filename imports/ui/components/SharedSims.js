import React from 'react'
import { SimsIndex } from '../../api/sims'
import { List, Input, Dimmer, Loader } from 'semantic-ui-react' 
 
export default class SharedSims extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            sims:[],
            searchTag:null,
            loading:true
        }
        this.displaySims.bind(this)
    }

    componentDidMount() {        


        this.simsTracker = Tracker.autorun(()=>{

            const simsHandle = Meteor.subscribe('sims.public')
            const loading = !simsHandle.ready()

            this.setState({
                sims:SimsIndex.search('').fetch(),
                selectedSim:null,
                loading
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
                    <List.Content style = {{paddingLeft:'2.4rem'}}>    
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
                <Dimmer inverted active = {this.state.loading}>
                    <Loader />
                </Dimmer>
                <Input ref = {e => this.searchTag = e} onChange = {this.search.bind(this)} label = 'search'/>
                <List  selection verticalAlign='middle'>
                    {this.displaySims()}
                </List>
            </div>
        )
    }
}