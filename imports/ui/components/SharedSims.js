/* eslint-disable */
import React from 'react'
import { SimsIndex } from '../../api/sims'
import { List, Input, Dimmer, Loader, Card } from 'semantic-ui-react' 
import moment from 'moment';
 
export default class SharedSims extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            sims:[],
            searchTag:null,
            loading:true,
            ownerNames:[]
        }
        this.displaySims.bind(this)
    }

    findTime = (time) => moment(time);

    componentDidMount() {        


        this.simsTracker = Tracker.autorun(()=>{

            const simsHandle = Meteor.subscribe('sims.public')
            const loading = !simsHandle.ready()

            this.setState({
                sims:SimsIndex.search('').fetch(),
                selectedSim:null,
                loading
            },()=>{
                Meteor.call('getUsernames', this.state.sims.map(sim=>sim.userId), (err, usernames)=>{

                    this.setState({
                        ownerNames:usernames
                    })
                })
            })            
        })
    }

    componentWillUnmount() {

        this.simsTracker.stop()
    }

    displayName(index) {

        if(this.state.ownerNames.length>0) {

            return this.state.ownerNames[index].username;
        }
    }

    displayTime(index) {

        if(this.state.sims.length>0) {

            return this.findTime(this.state.sims[index].createdAt).fromNow();
        }
    }

    displaySims() {

        const {sims} = this.state

        return sims.map((sim, index) =>{
            return (
                <Card style = {{width:'100%', margin:'0'}} key = {index} onClick = {()=>{
                    
                    this.setState({                        
                        selectedSim: sim
                    },()=>{
                        this.props.getNode(sim)
                    })
                }}>
                    <Card.Content>
                        <Card.Header>    
                            {sim.title}
                        </Card.Header>
                        <Card.Meta style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'row' }}>
                            <div>
                                {this.displayName(index)}
                            </div>
                            <div style = {{marginLeft:'0.4rem'}}>
                                updated {this.displayTime(index)}
                            </div>
                        </Card.Meta>
                    </Card.Content>
                </Card>
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