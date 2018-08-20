import React from 'react'
import List from '../components/List'
import Upload from '../components/Upload'
import { Requests } from '../../api/requests'
import CommentForm from '../components/CommentForm'
import CommentsList from '../components/CommentsList'
import { Link } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data';
import SimPreview from '../components/SimPreview'
import FaTrash from 'react-icons/lib/fa/trash'
import FaCode from 'react-icons/lib/fa/code'
import { Grid, Button, Form, Modal, Container, Dimmer, Loader, Segment, Menu} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import { Tracker } from 'meteor/tracker'

/* This component renders the page where the teachers post the requests for the new simulation 
    and the teachers and the other users have discussions about the simulations that they are trying to make.
*/

export default class Request extends React.Component {

    constructor(props) {

        super(props)

        /*
            If there are no topics, some elements need not be displayed, show variable is used to hide them.
            slides holds the contents of each slides. Each slide constitute the new request topics, the comments
            of each users and the simulations uploaded by them.

            curSlide holds the number of the current slide that is displayed.

            Iniitialized is set to true after the data is fetched from the database and set to the state.
            See the componentDidUpdate lifecycle method.

            selectedSim holds the sim that is currently selected and displayed inside the modal.
         */

        this.state = {
            
            show:false,
            slides: [],
            curSlide: 0,
            selectedSim:null,
            requestTitle: true,
            loading:true
        }
        this.update.bind(this)
        this.pushSim.bind(this)
        this.requestExists = false
        this.deleteSim.bind(this)
        this.push.bind(this)
    }


    componentDidMount() {

        this.requestsTracker = Tracker.autorun(()=>{

            const requestsHandle = Meteor.subscribe('requests')
            const loading = !requestsHandle.ready()
            const request = Requests.findOne(this.props.match.params._id)

            if(!request)
                return

            if(request.slides.length == 0) {

                request.slides[0] = {
                    title:'',
                    comments:[],
                    iframes:[]
                }
            }

            const show = !!request.slides[0].title  

            this.setState({
                ...request,
                show,
                loading
            })

        })
    }

    componentWillUnmount() {
        
        this.requestsTracker.stop()
    }

    push(e) {

        e.preventDefault();

        if(this.title.value) {

            const { slides } = this.state
            const title = this.title.value
            const curSlide = slides.length

            if(this.state.show == false) {
                            
                slides[0].title = this.title.value
                this.setState({slides, show:true})            
            }
            else {
                const slide = {
                    title: this.title.value,
                    comments: [],
                    iframes: []
                }
                slides.push(slide)
                this.setState({
                   title, 
                   slides,
                   curSlide
                })
            }
            this.title.value = ''
            this.update()
        }
    }

    update() {

        if(!Meteor.userId())
            return

        const { slides, requestTitle }  = this.state

        Meteor.call('requests.update',this.state._id, slides)

    }

    deleteSlide(index) {

        const isOwner = this.state.userId == Meteor.userId()

        if(isOwner)
        {
            const { slides } = this.state

            if(slides.length!=1) {
                slides.splice(index, 1)    
                let { curSlide } = this.state   
                if(index == 0) {
                    curSlide = 0
                }    
                if(curSlide == slides.length)
                    curSlide = slides.length-1
                this.saveChanges(slides, curSlide)
            }
            else
                this.reset()  
        }                
    }

    reset() {

        const slides = []

        const slide = {
            comments: [],
            iframes: [],
            title: '',
        }

        slides.push(slide)

        this.setState({
            curSlide:0,
            slides,
            title:'',
            show:false,

        },()=>{
            this.update()
            
        })
    }

    saveChanges(slides, curSlide) {

        if(slides == undefined) {
            this.setState({
                curSlide
            })
        }        
        else if(curSlide == undefined) {
            this.setState({
                slides
            })
        }        
        else {
            this.setState({
                slides,
                curSlide
            })
        }
        this.update()
    }
    
    pushSim(title, src, w, h, linkToCode) {
        const { slides, curSlide }  = this.state

        const objectToPush = {
            userId:Meteor.userId(),
            src,
            w,
            h,
            x:0,
            y:0,
            title,
            linkToCode
        }

        slides[curSlide].iframes.push(objectToPush)
        this.setState({
            slides
        })
        this.update()
    }

    deleteSim(index) {

        /* This function decides what to do when cross Button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */
        const confirmation = confirm('Are you sure you want to delete this sim')
        if(!confirmation)
            return

        const isOwner = this.state.userId == Meteor.userId()

        if(isOwner) {
            const { slides, curSlide }  = this.state
            const iframes = slides[curSlide].iframes        
            iframes.splice(index,1)
            slides[this.state.curSlide].iframes = iframes
            this.saveChanges(slides)
        }
        
    }

    deleteComment(index) {
        
        const { slides, curSlide }  = this.state
        slides[curSlide].comments.splice(index,1)
        this.saveChanges(slides)
    }

    setTitle(e) {

        e.preventDefault()

        this.setState({
            requestTitle:this.requestTitle.value
        },()=>{
            
            Meteor.call('requests.title.update', this.state._id, this.state.requestTitle)
        })

    }

    displaySims() {

        const {slides, curSlide} = this.state
        const sims = slides[curSlide]

        if(sims)
            return sims.iframes.map((sim, index) => {
                return (
                    <Menu.Item style = {{display:'flex', justifyContent:'space-between'}} key = {index}>
                        <Button onClick = {()=>{
                            this.setState({
                                selectedSim:sim
                            })
                        }} 
                        style = {{width:'100%', textAlign:'left'}}>{sim.title}</Button>
                        {Meteor.userId()==sim.userId?<Button onClick = {()=>{
                            this.deleteSim(index)
                        }}><FaTrash/></Button>:null}
                    </Menu.Item>
                )
            })
    }

    displayMenu() {

        const {slides, curSlide} = this.state
        const sim = slides[curSlide]
        if(sim) {
            if(sim.iframes.length>0) {
                return <Menu style = {{display:'flex', width:'100%'}} vertical>
                    {this.displaySims()}        
                </Menu>
            }
        }
    }

    render() {


        const isOwner = this.state.userId == Meteor.userId()

        return (

            <Segment>
            
                <Dimmer inverted active = {this.state.loading}>
                    <Loader />
                </Dimmer>

                <Modal size = 'small' style = {{width:'auto'}} open = {!!this.state.selectedSim}>
                    <Modal.Header>
                        Preview
                        <div className ='close-button'>
                            <a className = 'link-to-code' target = '_blank' href = {this.state.selectedSim?this.state.selectedSim.linkToCode:''}><Button><FaCode/></Button></a>                  
                            <Button  onClick = {()=>{this.setState({selectedSim:null})}}>X</Button>                        
                        </div>
                    </Modal.Header>
                    <Modal.Content>
                        <SimPreview src = {this.state.selectedSim?this.state.selectedSim.src:null}/>
                    </Modal.Content>
                </Modal>

                <div>
                    <Grid style = {{height:'100vh'}}  columns={3} divided>
                        <Grid.Row>
                            <Grid.Column width = {4} style = {{overflow:'auto'}}>                                
                                    <div style = {{margin:'1.6rem'}}>

                                        <Button onClick = {()=>{
                                            history.back()
                                            }}>Back</Button>

                                            {isOwner?<Button onClick = {()=>{
                                            
                                            const confirmation = confirm('Are you sure you want to close this forum?')

                                            if(confirmation && isOwner) {
                                                Meteor.call('requests.reset', this.state._id)
                                                history.back()
                                            }   

                                            }}>Close this request forum</Button>:null}                         
                                                                
                                        <h1>{this.state.requestTitle}</h1>

                      

                                    </div>

                                    {isOwner?
                                    
                                        <Form onSubmit = {this.push.bind(this)}>
                                        
                                            <Form.Field>
                                                <input placeholder = 'Title for the new topic' ref = {e => this.title = e}/>
                                            </Form.Field>

                                            <Form.Field>
                                                <Button >Create new topic</Button>
                                            </Form.Field>

                                        </Form>:

                                    null}

                                    {this.state.show?<List userId = {this.state.userId} from = {'request'} showTitle = {true} {...this.state} saveChanges= {this.saveChanges.bind(this)} delete = {this.deleteSlide.bind(this)}  />:null}
                                
                            </Grid.Column>
                            <Grid.Column width = {7} style = {{overflow:'auto', padding:'1.6rem'}}>
                        
                                    {this.state.show?<CommentsList  deleteComment = {this.deleteComment.bind(this)} {...this.state}/>:null}
                                    <br/>
                                    {this.state.show && !!Meteor.userId()?<CommentForm {...this.state} saveChanges= {this.saveChanges.bind(this)}/>:
                                    null}
                        
                            </Grid.Column>
                            <Grid.Column width = {5} style = {{overflow:'auto', padding:'1.6rem'}}>
                                        
                                {Meteor.userId()?<div style = {{marginBottom:'1.6rem'}}>
                                    {this.state.show?<Upload methodToRun = {this.pushSim.bind(this)}/>:null}
                                </div>:null}
                                    
                                    {this.state.show?this.displayMenu.bind(this)():null}
                                    
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>


                    {isOwner?

                    <Modal
                        open = {!!!this.state.requestTitle}
                        size = 'tiny'
                        
                    >

                        <Modal.Header>

                            Title for the request forum                         
   
                            <Link to={{ pathname: `/createlessonplan/${this.state._id}`}}>
                                <Button link className = 'close-button'>X</Button> 
                            </Link>                                       

                        </Modal.Header>

                        <Modal.Content>

                                <Modal.Description> 

                                    <Form onSubmit = {this.setTitle.bind(this)}>
                                        <Form.Field>
                                            <label>Title</label>
                                            <input ref = {e => this.requestTitle = e}/>
                                        </Form.Field>

                                        <Form.Field>
                                            <Button>Submit</Button>
                                        </Form.Field>
                                    </Form>

                                </Modal.Description>

                            </Modal.Content> 

                    </Modal>:null}             

                </div>            
            </Segment>
        )
    }
}
