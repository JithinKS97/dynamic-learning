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
        this.handleClose.bind(this)

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
                linkToCode:this.state.node.linkToCode,
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
            { menuItem: 'Simulation Pool', render: () => <Tab.Pane style = {{height:'429px'}}><SimPool getNode = {this.getNode.bind(this)}/></Tab.Pane> },
          ]


        return(
            <div>

                <Modal                
                    
                    open={this.state.isOpen}
                    onClose={this.handleClose}
                    size='large'      
                                       
                >


                    <Modal.Header>
                        Simulations
                        <Button
                            className = 'close-button'
                            onClick = {()=>{                                        
                            this.setState({
                                node:this.handleClose()
                        
                            })
                        }}>X</Button>
                    </Modal.Header>

                    <Modal.Content>

                        <Modal.Description>
                            <Grid
                                style = {{paddingBottom:'1.6rem'}} 
                                columns={2} 
                                divided
                            >
                                
                                <Grid.Column width = {8}>
                                   <Tab onTabChange = {()=>{this.setState({node:null})}} panes={panes}/>   
                                </Grid.Column>

                                {this.state.node?<Grid.Column style = {{overflow:'auto', marginTop:'43px'}}>
                                    <SimPreview  {...this.state.node}/>                 
                                </Grid.Column>:null}

                                {this.state.node?<Button style = {{marginLeft:'0.8rem'}} onClick = {this.addToLesson.bind(this)}>Add to lesson</Button>:null}
                                
                            </Grid>       
                            
                           </Modal.Description>
                    </Modal.Content>

                </Modal>
            </div>
        )
    }
}