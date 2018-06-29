import React from 'react'

import LessonPlansDirectories from '../components/LessonPlansDirectories'
import RequestsList from '../components/RequestsList'
import SimsDirectories from '../components/SimsDirectories'
import SideBar from '../components/SideBar'
import { Accounts } from 'meteor/accounts-base'
import SimPreview from '../components/SimPreview'

import { Sims } from '../../api/sims'

import { Tab } from 'semantic-ui-react'

import { Tracker } from 'meteor/tracker'

import SharedLessonPlans from '../components/SharedLessonPlans'



import { Grid, Button, Modal, Checkbox, Label } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
 
export default class Dashboard extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            node:null,
            modelOpen:false,
            isPublic:null,
            editable:false,
            title:''
        }
        
        this.renderOption.bind(this)

    }

    componentDidMount() {

        this.simsTracker = Tracker.autorun(()=>{

            if(this.state.node) {

                const sim = Sims.findOne({_id:this.state.node._id})
                this.setState({
                    node:sim
                })
            }
                
        })
    }

    componentWillUnmount() {

        this.simsTracker.stop()
    }


    getNode(node) {
        this.setState({
            node
        },()=>{
            const sim = Sims.findOne({_id:node._id})
            this.setState({
                node:sim,
                isPublic: sim.isPublic,
                title:node.title
            })
            
        })
    }

    renderOption() {

        const panes = [
            { menuItem: 'My lessonplans', render: () => <Tab.Pane> <LessonPlansDirectories/></Tab.Pane> },
            { menuItem: 'Shared lessonplans', render: () => <Tab.Pane style = {{height:'436px'}}><SharedLessonPlans/></Tab.Pane> },
          ]

        

       const option = this.props.match.params.option

       switch(option) {
            case 'lessonplans':
                return <Tab panes = {panes}/>
            case 'requests':
                return <RequestsList/>
            case 'uploadsim':
                return <SimsDirectories getNode = {this.getNode.bind(this)} isPreview = {false}/>
       }
    }

    handleClose = () => this.setState({node:null, editable:false})  

    handleChange = (event) => {

        this.setState({html: event.target.value})
    }

    editTitle() {

        if(this.state.editable == false) {
            
           this.setState({editable:true})
        }
        else {

            if(this.title.value === '')
                return

            Meteor.call('sims.titleChange', this.state.node._id, this.state.title)
            this.setState({editable:false})
        }
    }

    render() {
        return(
            <div>
            
                    <Modal
                        closeOnRootNodeClick={false}                
                        style = {{width:'auto'}}
                        open={!!this.state.node}
                        onClose={this.handleClose}
                        size='tiny'            
                    >
                        <Modal.Header>
                            Preview
                            <Button className = 'close-button' onClick = {this.handleClose}>
                                X
                            </Button> 
                        </Modal.Header>

                        <Modal.Content>
                            <Modal.Description>                        
                                <SimPreview {...this.state.node}/>                        
                                <br/>
                                {this.state.editable?null:<Label style = {{padding:'0.8rem'}}><h4>{this.state.node?this.state.title:null}</h4></Label>}
                                {this.state.editable?<input ref = {e=>this.title = e} onChange = {()=>{this.setState({title:this.title.value})}} style = {{padding:'0.8rem'}} ref = {e => this.title = e}/>:null}
                                <Button onClick = {this.editTitle.bind(this)} style = {{marginLeft:'0.8rem'}}>{this.state.editable?'Submit':'Edit title'}</Button> 
                            </Modal.Description>
                            <Modal.Description>  
                                <Checkbox 
                                    style = {{marginTop:'0.8rem'}}
                                    checked = {this.state.isPublic}
                                    ref = {e => this.checkbox = e }
                                    onChange = {()=>{

                                        Meteor.call('sims.visibilityChange', this.state.node._id, !this.checkbox.state.checked)
                                        this.setState({
                                            isPublic: !this.checkbox.state.checked
                                        })      

                                }} label = 'Share with others'/> 
                            </Modal.Description>
                        </Modal.Content>         

                    </Modal>

                <Button onClick = {()=>{Accounts.logout()}}>Log out</Button>   
                <Grid columns={3} divided>
                    <Grid.Row>
                        <Grid.Column >
                            <SideBar/> 
                        </Grid.Column>
                        <Grid.Column >
                            {this.renderOption()}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}



