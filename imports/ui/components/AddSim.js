import React from 'react'

import SimsDirectories from './SimsDirectories'

import { Button, Grid, Modal } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import SimContainer from './SimContainer'

export default class AddSim extends React.Component {



    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            node:null
        }

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
        },()=>{
            console.log(this.state.node)
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

    render() {


        return(
            <div>

                <Modal                
                    
                    open={this.state.isOpen}
                    onClose={this.handleClose}
                    size='large'      
                                       
                >


                    <Modal.Header>My simulations</Modal.Header>

                    <Modal.Content>
                        <Modal.Description>
                            <Grid columns={2} divided>
                                
                                <Grid.Column>
                                    <SimsDirectories isPreview = {true} getNode = {this.getNode.bind(this)} ref = {e => this.simDirectories = e}/>
                                </Grid.Column>

                                <Grid.Column style = {{overflow:'auto'}}>
                                    <SimContainer {...this.state.node}/>
                                    {this.state.node?<Button onClick = {this.addToLesson.bind(this)}>Add to lesson</Button>:null}
                                </Grid.Column>
                                
                            </Grid>
            

                            <Button onClick = {()=>{
                                this.handleClose()
                                this.setState({
                                    node:null
                                })
                            }}>Close</Button>
                        </Modal.Description>
                    </Modal.Content>

                </Modal>
            </div>
        )
    }
}