import React from 'react'
import List from './List'
import SimsList from './SimsList'
import Upload from './Upload'
import { Requests } from '../api/requests'
import CommentForm from './CommentForm'
import CommentsList from './CommentsList'
import {Tracker} from 'meteor/tracker'
import { Link } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'

export default class Request extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            show:false,
            slides: [],
            curSlide: 0
        }
        this.update.bind(this)
        this.pushSim.bind(this)
    }

    componentDidMount() {

        Meteor.subscribe('requests')

        this.requestsTracker = Tracker.autorun(()=>{

            const {_id} = this.props.match.params
            
            Meteor.subscribe('requests')

            const requests = Requests.findOne(_id)

            if(requests) {
                const show = !!requests.slides[0].title   
                this.setState({
                    ...requests,
                    show
                })
            }          
        })
    }

    componentWillUnmount() {
        this.requestsTracker.stop()
    }

    push(e) {

        e.preventDefault();

        if(this.refs.title.value) {

            const { slides } = this.state
            curSlide = slides.length

            if(this.state.show == false) {            
                slides[0].title = this.refs.title.value
                this.setState({slides, show:true})            
            }
            else {
                slide = {
                    title: this.refs.title.value,
                    comments: [],
                    iframes: []
                }
                slides.push(slide)
                this.setState({
                    slides,
                    curSlide
                })
            }
            this.refs.title.value = ''
            this.update()
        }
    }

    update() {
        const { slides }  = this.state
        Requests.update(this.state._id, {$set:{slides}})
    }

    deleteSlide(slides, index) {

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
            show:false
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

    deleteSim(slides, iframeArray, index) {

        /* This function decides what to do when cross button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */
        
        iframeArray.splice(index,1)
        slides[this.state.curSlide].iframes = iframeArray
        this.saveChanges(slides)
    }

    deleteComment(index) {
        
        const { slides, curSlide }  = this.state

        slides[curSlide].comments.splice(index,1)
        this.saveChanges(slides)
    }

    render() {

    return (
            <div>
                                
                <h1>Request</h1>

                <form onSubmit = {this.push.bind(this)}>
                    <input ref = 'title'/>
                    <button>New request</button>
                </form>
                                
                <h1>{this.state.curSlide}</h1>

                {this.state.show?<List showTitle = {true} {...this.state} saveChanges= {this.saveChanges.bind(this)} delete = {this.deleteSlide.bind(this)}  />:null}

                {this.state.show?<CommentForm {...this.state} saveChanges= {this.saveChanges.bind(this)}/>:null}

                {this.state.show?<CommentsList deleteComment = {this.deleteComment.bind(this)} {...this.state}/>:null}

                {this.state.show?<Upload isOpen = {true} methodName = {(name, src, w, h, callback)=>{

                    this.pushSim(src,w,h)
                    callback();

                }}/>:null}

                <Link to = {`/createlessonplan/${this.state._id}`}><button>Back</button></Link>
                
                <SimsList rnd = {false} saveChanges = {this.saveChanges.bind(this)} delete = {this.deleteSim.bind(this)} {...this.state}/>

            </div>
        )  
    }
}