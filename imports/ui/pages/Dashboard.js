import React from 'react'

import LessonPlansDirectories from '../components/LessonPlansDirectories'
import RequestsList from '../components/RequestsList'
import SimsDirectories from '../components/SimsDirectories'
import SideBar from '../components/SideBar'
import { Accounts } from 'meteor/accounts-base'
import SimPreview from '../components/SimPreview'

import { Sims } from '../../api/sims'

import { Tracker } from 'meteor/tracker'


import { Grid, Button, Modal, Checkbox } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
 
export default class Dashboard extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            node:null,
            modelOpen:false,
            isPublic:null
        }
        
        this.renderOption.bind(this)

    }


    getNode(node) {
        this.setState({
            node
        },()=>{
            const sim = Sims.findOne({_id:node._id})
            this.setState({
                node:sim,
                isPublic: sim.isPublic
            })
            
        })
    }

    renderOption() {

       const option = this.props.match.params.option

       switch(option) {
            case 'lessonplans':
                return <LessonPlansDirectories/>
            case 'requests':
                return <RequestsList/>
            case 'uploadsim':
                return <SimsDirectories getNode = {this.getNode.bind(this)} isPreview = {false}/>
       }
    }

    handleClose = () => this.setState({node:null})  

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
                        <Modal.Header>Preview</Modal.Header>

                        <Modal.Content>                          
                            <SimPreview {...this.state.node}/>
                            {this.state.node?<h4>{this.state.node.title}</h4>:null}
                            <Checkbox 
                                checked = {this.state.isPublic}
                                ref = {e => this.checkbox = e }onChange = {()=>{

                                 Meteor.call('sims.visibilityChange', this.state.node._id, !this.checkbox.state.checked)
                                 this.setState({
                                     isPublic: !this.checkbox.state.checked
                                 })      

                            }} label = 'public'/>             
                        </Modal.Content>

                         <Modal.Content>                          
                            <Button onClick = {this.handleClose}>
                                Close
                            </Button>               
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



