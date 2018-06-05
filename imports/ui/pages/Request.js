import React from 'react'
import List from '../components/List'
import SimsList from '../components/SimsList'
import Upload from '../components/Upload'
import { Requests } from '../../api/requests'
import CommentForm from '../components/CommentForm'
import CommentsList from '../components/CommentsList'
import { Link } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import Modal from 'react-modal'
import { Tracker } from 'meteor/tracker' 

export default class Request extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            show:false,
            slides: [],
            curSlide: 0,
            initialized:false,
        }
        this.update.bind(this)
        this.pushSim.bind(this)
        this.requestExists = false
    }

    componentDidMount() {

        this.requestsTracker = Tracker.autorun(()=>{

            const requestsHandle = Meteor.subscribe('requests')
            const loading = !requestsHandle.ready()
            const request = Requests.findOne(this.props.match.params._id)
            this.requestExists = !loading && !!request

            if(this.requestExists) {
            
                if(request.slides.length == 0)
                {
                    request.slides[0] = {
                        title:'',
                        comments:[],
                        iframes:[]
                    }
                }
    
                const show = !!request.slides[0].title   
                this.setState({
                    ...request,
                    initialized:true,
                    show
                })
            }
        })

        this.push.bind(this)
    }

    componentWillUnmount() {
        this.requestsTracker.stop()
    }

    push(e) {

        e.preventDefault();

        if(this.title.value) {

            const { slides } = this.state
            const title = this.title.value
            curSlide = slides.length

            if(this.state.show == false) {            
                slides[0].title = this.title.value
                this.setState({slides, show:true})            
            }
            else {
                slide = {
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
    
    pushSim(src, w, h) {
        const { slides, curSlide }  = this.state

        const toPush = {
            userId:Meteor.userId(),
            src,
            w,
            h,
            x:0,
            y:0
        }

        slides[curSlide].iframes.push(toPush)
        this.setState({
            slides
        })
        this.update()
    }

    deleteSim(index) {

        /* This function decides what to do when cross button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */
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

    render() {


        const isOwner = this.state.userId == Meteor.userId()

        return (

            <div className = 'request'>


                {isOwner?<Modal ariaHideApp={false} isOpen = {this.state.requestTitle?false:true}>
                    <form onSubmit = {this.setTitle.bind(this)}>
                        <input ref = {e => this.requestTitle = e}/>
                        <button>Submit</button>
                        <Link to={{ pathname: `/createlessonplan/${this.state._id}`}}>
                            Back
                        </Link>
                    </form>
                </Modal>:null}

                <div className='request_slides'>

                    <h1>{this.requestExists?null:'Loading'}</h1>

                    {isOwner?<button onClick = {()=>{
                        
                        const confirmation = confirm('Are you sure you want to delete all the requests?')

                        if(confirmation && isOwner)
                        {
                            Meteor.call('requests.reset', this.state._id)
                            history.back()
                        }                        
                        

                    }}>Remove Request</button>:null}

                    <h1>{this.state.requestTitle}</h1>
                    
                    <button onClick = {()=>{
                        history.back()
                    }}>Back</button>

                    <h1>{this.state.curSlide}</h1>

                    {isOwner?<form onSubmit = {this.push.bind(this)}>
                        <input ref = {e => this.title = e}/>
                        <button>New request</button>
                    </form>:null}

                    {this.state.show?<List showTitle = {true} {...this.state} saveChanges= {this.saveChanges.bind(this)} delete = {this.deleteSlide.bind(this)}  />:null}

                </div>

                <div className = 'request_comments'>

                    {this.state.show?<CommentsList deleteComment = {this.deleteComment.bind(this)} {...this.state}/>:null}
                    {this.state.show?<CommentForm {...this.state} saveChanges= {this.saveChanges.bind(this)}/>:null}

                </div>

                <div className = 'request_sims'>

                    {this.state.show?<Upload methodToRun = {this.pushSim.bind(this)}/>:null}
                    <SimsList isRndRequired = {false} preview = {false} rnd = {false} saveChanges = {this.saveChanges.bind(this)} delete = {this.deleteSim.bind(this)} {...this.state}/>
                    
                </div>                  
                

            </div>

        )
    }
}