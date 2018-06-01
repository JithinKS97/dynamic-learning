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

class Request extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            show:false,
            slides: [],
            curSlide: 0,
            initialized:false
        }
        this.update.bind(this)
        this.pushSim.bind(this)
    }

    componentDidMount() {
        this.push.bind(this)
    }

    componentDidUpdate() {

        const {requestExists, request} = this.props

        if(this.state.initialized == false && requestExists) {

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
        else if(!requestExists) {
            console.log('loading')
        }    

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

    deleteSim(index) {

        /* This function decides what to do when cross button is pressed in the
           simulation. The simulation is deleted from the iframes array and the
           changes are saved.
        */
        const { slides, curSlide }  = this.state
        const iframes = slides[curSlide].iframes        
        iframes.splice(index,1)
        slides[this.state.curSlide].iframes = iframes
        this.saveChanges(slides)
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
            console.log(this.state.requestTitle)
            Meteor.call('requests.title.update', this.state._id, this.state.requestTitle)
        })

    }

    render() {

        return (

            <div className = 'request' style = {{visibility:this.state.initialized?'visible':'hidden'}}> 
                <Modal ariaHideApp={false} isOpen = {this.state.requestTitle?false:true}>
                    <form onSubmit = {this.setTitle.bind(this)}>
                        <input ref = {e => this.requestTitle = e}/>
                        <button>Submit</button>
                    </form>
                </Modal>

                <div className='request_slides'>

                    <h1>{this.state.requestTitle}</h1>
                    
                    <button onClick = {()=>{
                        console.log(history.back())
                    }}>Back</button>

                    <h1>{this.state.curSlide}</h1>

                    <form onSubmit = {this.push.bind(this)}>
                        <input ref = {e => this.title = e}/>
                        <button>New request</button>
                    </form>

                    {this.state.show?<List showTitle = {true} {...this.state} saveChanges= {this.saveChanges.bind(this)} delete = {this.deleteSlide.bind(this)}  />:null}

                </div>

                <div className = 'request_comments'>

                    {this.state.show?<CommentForm {...this.state} saveChanges= {this.saveChanges.bind(this)}/>:null}
                    {this.state.show?<CommentsList deleteComment = {this.deleteComment.bind(this)} {...this.state}/>:null}

                </div>

                <div className = 'request_sims'>

                    {this.state.show?<Upload method = {this.pushSim.bind(this)}/>:null}
                    <SimsList isRndRequired = {false} preview = {false} rnd = {false} saveChanges = {this.saveChanges.bind(this)} delete = {this.deleteSim.bind(this)} {...this.state}/>
                    
                </div>                  
                

            </div>

        )
    }
}

export default RequestsContainer = withTracker(({match})=>{

    const lessonplansHandle = Meteor.subscribe('requests')
    const loading = !lessonplansHandle.ready()
    const request = Requests.findOne(match.params._id)
    const requestExists = !loading && !!request

    return {
        request,
        requestExists,
        loading
    }

})(Request)