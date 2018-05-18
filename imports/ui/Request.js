import React from 'react'
import List from './List'
import SimsList from './SimsList'
import Upload from './Upload'
import { Requests } from '../api/requests'
import { Meteor } from 'meteor/tracker'
import Forum from './Forum'
import {Tracker} from 'meteor/tracker'
import { Link } from 'react-router-dom'

export default class Request extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            show:false,
            slides: [],
            currSlide: 0,
        }
        this.update.bind(this)
        this.pushSim.bind(this)
    }

    componentDidMount() {

        this.requestsTracker = Tracker.autorun(()=>{

            const requests = Requests.findOne(this.props.match.params._id)

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

    deleteSim() {
    }

    push(e) {

        e.preventDefault();

        if(this.refs.title.value) {

            slides = this.state.slides
            currSlide = slides.length

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
                    currSlide
                })
            }
            this.refs.title.value = ''
            this.update()
        }
    }

    update() {
        const slides = this.state.slides
        Requests.update(this.state._id, {$set:{slides}})
    }

    deleteSlide(slides, index) {

        if(slides.length!=1) {
            slides.splice(index, 1)    
            let currSlide = index-1    
            if(index == 0) {
                currSlide = 0
            }    
            this.saveChanges(slides, currSlide)
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
            currSlide:0,
            slides,
            title:'',
            show:false
        },()=>{
            this.update()
        })
    }

    saveChanges(slides, currSlide) {

        if(slides == undefined) {
            this.setState({
                currSlide
            })
        }        
        else if(currSlide == undefined) {
            this.setState({
                slides
            })
        }        
        else {
            this.setState({
                slides,
                currSlide
            })
        }
        this.update()
    }
    
    pushSim(iframe) {
        slides = this.state.slides
        currSlide = this.state.currSlide
        slides[currSlide].iframes.push(iframe)
        this.setState({
            slides
        })
    }

    deleteSim(slides, iframeArray, index) {

        /* This function decides what to do when cross button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */
        
        iframeArray.splice(index,1)
        slides[this.state.currSlide].iframes = iframeArray
        this.saveChanges(slides)
    }
    


    render() {

    return (
            <div>
                <h1>Request</h1>
                <SimsList delete = {this.deleteSim.bind(this)} {...this.state}/>

                <form onSubmit = {this.push.bind(this)}>
                    <input ref = 'title'/>
                    <button>New request</button>
                </form>
                                
                <h1>{this.state.currSlide}</h1>

                {this.state.show?<List showTitle = {true} {...this.state} saveChanges= {this.saveChanges.bind(this)} delete = {this.deleteSlide.bind(this)}  />:null}

                {this.state.show?<Forum {...this.state} saveChanges= {this.saveChanges.bind(this)}/>:null}

                {this.state.show?<Upload isOpen = {true} methodName = {(name, iframe, callback)=>{

                    this.pushSim(iframe)
                    callback();

                }}/>:null}

                <Link to = {`/createlessonplan/${this.state._id}`}><button>Back</button></Link>

            </div>
        )  
    }
}