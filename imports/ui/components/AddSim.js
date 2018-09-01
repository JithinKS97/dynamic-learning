import React from 'react'
import SimsDirectories from './SimsDirectories'
import { Button, Grid, Modal, Tab } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import SimPreview from './SimPreview'
import SharedSims from './SharedSims'
import FaCode from 'react-icons/lib/fa/code'
import { Meteor } from 'meteor/meteor'

/*
    This component is for the addition of simulations to the lessonplan.
*/

export default class AddSim extends React.Component {

    constructor(props) {

        super(props)
        this.state = {
            isOpen: false,
            node:null,
            username:''
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


    addToLesson() {

        if(this.state.node) {

            const { slides, curSlide } = this.props                                

            const sim = {
                linkToCode:this.state.node.linkToCode,
                src:this.state.node.src,
                w:this.state.node.w,
                h:this.state.node.h,
                x:50,
                y:50,
                data:{},
                pane:null
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
        },()=>{
            Meteor.call('getUsername', this.state.node.userId,(err, username) => {
                this.setState({
                    username
                })
            })
        })
    }


    render() {


        const panes = [
            { menuItem: 'My simulations', render: () => <Tab.Pane><SimsDirectories height = {400} getNode = {this.getNode.bind(this)} isPreview= {true}/></Tab.Pane> },
            { menuItem: 'Shared simulations', render: () => <Tab.Pane style = {{height:'429px'}}><SharedSims getNode = {this.getNode.bind(this)}/></Tab.Pane> },
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
                                   <Tab ref = { e => this.tab = e} onTabChange = {(event, data)=>{
                                       this.setState({node:null})
                                    }} panes={panes}/>   
                                </Grid.Column>

                                {this.state.node?<Grid.Column style = {{overflow:'auto', marginTop:'43px'}}>
                                    <SimPreview  {...this.state.node}/>                 
                                </Grid.Column>:<h2 style = {{margin:'auto'}} >Select a simulation</h2>}
                                
                                {this.state.node?<Button style = {{marginLeft:'0.8rem', visibility:this.state.node?'visible':'hidden'}} onClick = {this.addToLesson.bind(this)}>Add to lesson</Button>:null}
                                {this.state.node?<a className = 'link-to-code' target = '_blank' href = {this.state.node?this.state.node.linkToCode:''}><Button><FaCode/></Button></a>:null}
                                {this.state.node && this.tab.state.activeIndex === 1?<p style = {{paddingTop:'0.8rem'}}>{`Created by ${this.state.username}`}</p>:null}
                                
                            </Grid>    
                            
                         </Modal.Description>
                    </Modal.Content>

                </Modal>
            </div>
        )
    }
}