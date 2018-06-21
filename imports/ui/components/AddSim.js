import React from 'react'

import SimsDirectories from './SimsDirectories'

import { Button, Grid, Modal, Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import SimPreview from './SimPreview'

import SimPool from './SimPool'


export default class AddSim extends React.Component {



    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            node:null
        }
        this.handleOpen.bind(this)

    }

    componentDidMount() {
        
        Meteor.subscribe('sims.public')
    }

    addSim() {
        
        this.setState({isOpen:true})
    }

    handleOpen() {
        this.setState({
            isOpen: true
        })
    }

    handleClose() {
        this.setState({
            isOpen: false
        })
    }

    getNode(node) {

        

        this.setState({
            node
        })
    }

    addToLesson() {

        if(this.state.node) {

            console.log(this.state.node)

            const { slides, curSlide } = this.props
                                

            const sim = {
                src:this.state.node.src,
                w:this.state.node.w,
                h:this.state.node.h,
                x:0,
                y:0,
                data:{}
            }

            slides[curSlide].iframes.push(sim)

            this.props.saveChanges(slides)

            this.setState({
                isOpen:false,
                node:null
            })

        }

    }

    getNode(node) {

        this.setState({
            node
        })
    }

    render() {

        const panes = [
            { menuItem: 'My simulations', render: () => <Tab.Pane><SimsDirectories getNode = {this.getNode.bind(this)} isPreview= {true}/></Tab.Pane> },
            { menuItem: 'Simulation Pool', render: () => <Tab.Pane><SimPool getNode = {this.getNode.bind(this)}/></Tab.Pane> },
          ]


        return(
            <div>

                <Modal                
                    
                    open={this.state.isOpen}
                    onClose={this.handleClose}
                    size='fullscreen'      
                                       
                >


                    <Modal.Header>
                        Simulations
                    </Modal.Header>

                    <Modal.Content>

                        <Modal.Description>
                            <Grid
                                style = {{paddingBottom:'1.6rem'}} 
                                columns={2} 
                                divided
                            >
                                
                                <Grid.Column width = {8}>
                                   <Tab panes={panes}/>   
                                </Grid.Column>

                                <Grid.Column style = {{overflow:'auto', marginTop:'43px'}}>
                                    <SimPreview  {...this.state.node}/>                 
                                </Grid.Column>

                                <Button

                                        onClick = {()=>{                                        
                                        this.setState({
                                            node:this.handleClose()
                                    
                                        })
                                }}>Close</Button>

                                {this.state.node?<Button onClick = {this.addToLesson.bind(this)}>Add to lesson</Button>:null}
                                
                            </Grid>       
                            
                           </Modal.Description>
                    </Modal.Content>

                </Modal>
            </div>
        )
    }
}