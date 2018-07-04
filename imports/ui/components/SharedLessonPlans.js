import React from 'react'
import { LessonPlansIndex } from '../../api/lessonplans'
import { List, Modal,Button, Input, Dimmer, Loader } from 'semantic-ui-react'
import LessonPlanViewer from './LessonPlanViewer'

import FaCodeFork from 'react-icons/lib/fa/code-fork'


 
export default class SharedLessonPlans extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            lessonplans:[],
            lessonplan:null,
            username:'',
            loading:true
        }
        this.displayLessonPlans.bind(this)
    }

    componentDidMount() {  
        
        this.lessonplansTracker = Tracker.autorun(()=>{

            const lessonplansHandle = Meteor.subscribe('lessonplans.public')
            const loading = !lessonplansHandle.ready()

            this.setState({
                lessonplans:LessonPlansIndex.search('').fetch(),
                selectedLessonPlan:null,
                loading
            })            
        })
    }

    componentWillUnmount() {

        this.lessonplansTracker.stop()
    
    }

    displayLessonPlans() {

        const {lessonplans} = this.state

        return lessonplans.map((lessonplan, index) =>{
            return (
                <List.Item key = {index} onClick = {()=>{
                    this.setState({                        
                        selectedLessonPlan: lessonplan
                    },()=>{
                        Meteor.call('getUsername', this.state.selectedLessonPlan.userId,(err, username) => {
                            this.setState({
                                username
                            })
                        })
                    })
                }}>
                    <List.Content onClick = {()=>{this.setState({lessonplan})}}>    
                        {lessonplan.title}
                    </List.Content>
                </List.Item>
            )
        })

    }
    search(event, data) {

        Tracker.autorun(()=>{
            this.setState({
                lessonplans:LessonPlansIndex.search(data.value).fetch()
            })
        })        
    }

    getId() {

        if(!this.state.selectedLessonPlan)
            return

        if(this.state.selectedLessonPlan.__originalId == undefined)
            return this.state.selectedLessonPlan._id
        else
            return this.state.selectedLessonPlan.__originalId
    }

    render() {

        return(
            <div>

                <Dimmer inverted active = {this.state.loading}>
                    <Loader />
                </Dimmer>
                <Modal 
                    open = {!!this.state.lessonplan}
                    size = 'fullscreen'
                    style = {{transform: 'scale(0.79, 0.79)', marginTop:'8rem'}}
                >
                    <Modal.Header>
                        Preview
                        <div style = {{float:'right'}}>

                        <Button onClick = {()=>{

                        const confirmation = confirm('Are you sure you want to fork this lesson?')
                                                    
                        if(!confirmation)
                            return

                        Meteor.call('lessonplans.insert', this.state.lessonplan.title, (err, _id) => {

                                Meteor.call('lessonplans.update', _id, this.state.lessonplan.slides)
                                this.setState({lessonplan:null})
                                confirm('Lesson has been succesfully forked')                                               

                            })
                        }}><FaCodeFork/>
                        Fork
                        </Button>
                        
                        <Button onClick = {()=>{this.setState({lessonplan:null})}}>X</Button>
                        </div>
                    </Modal.Header>
                    <Modal.Content>                      
                        <LessonPlanViewer _id = {this.getId.bind(this)()}/>
                        {this.state.lessonplan?<p style = {{paddingTop:'0.8rem', paddingLeft:'0.8rem', fontSize:'1.2rem'}}>{`Created by ${this.state.username}`}</p>:null}
                    </Modal.Content>
               </Modal>
                <Input ref = {e => this.searchTag = e} onChange = {this.search.bind(this)} label = 'search'/>
                <List style = {{width:'100%', height:'100%'}}  selection verticalAlign='middle'>
                    {this.displayLessonPlans()}
                </List>
            </div>
        )
    }
}