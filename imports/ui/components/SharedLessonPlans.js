/* eslint-disable */
import React from 'react'
import { LessonPlansIndex } from '../../api/lessonplans'
import { List, Modal,Button, Input, Dimmer, Loader, Card } from 'semantic-ui-react'
import LessonPlanViewer from './LessonPlanViewer'
import FaCodeFork from 'react-icons/lib/fa/code-fork'
import {Link} from 'react-router-dom'
import moment from 'moment';
 
export default class SharedLessonPlans extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            lessonplans:[],
            lessonplan:null,
            username:'',
            loading:true,
            ownerNames:[]
        }
        this.displayLessonPlans.bind(this)
    }

    findTime = (time) => moment(time);

    componentDidMount() {  
        
        this.lessonplansTracker = Tracker.autorun(()=>{

            const lessonplansHandle = Meteor.subscribe('lessonplans.public')
            const loading = !lessonplansHandle.ready()

            this.setState({
                lessonplans:LessonPlansIndex.search('').fetch(),
                selectedLessonPlan:null,
                loading
            },()=>{
                
                Meteor.call('getUsernames', this.state.lessonplans.map(lessonplan=>lessonplan.userId), (err, usernames)=>{

                    this.setState({
                        ownerNames:usernames
                    })
                })
            })            
        })
    }

    componentWillUnmount() {

        this.lessonplansTracker.stop()
    
    }

    displayName(index) {

        if(this.state.ownerNames.length>0) {

            if(this.state.ownerNames[index].username)
                return this.state.ownerNames[index].username;
        }
    }

    displayTime(index) {

        if(this.state.lessonplans.length>0) {

            return this.findTime(this.state.lessonplans[index].createdAt).fromNow();
        }
    }

    displayLessonPlans() {

        const {lessonplans} = this.state

        return lessonplans.map((lessonplan, index) =>{
            return (
                <Card style = {{width:'100%', margin:0}} key = {index} onClick = {()=>{
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
                    <Card.Content onClick = {()=>{this.setState({lessonplan})}}>    
                        <Card.Header>{lessonplan.title}</Card.Header>
                        <Card.Meta style={{ marginLeft:'0.4rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'row' }}>
                            <div>
                                {this.displayName(index)}
                            </div>
                            <div style = {{marginLeft:'0.4rem'}}>
                                created {this.displayTime(index)}
                            </div>
                        </Card.Meta>
                    </Card.Content>
                </Card>
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
                    style = {{transform: 'scale(0.79, 0.79)', marginTop:'3rem'}}
                >
                    <Modal.Header style = {{transformOrigin:'left'}}>
                        Preview
                        <div style = {{float:'right'}}>

                        

                        <Link to = {`/createlessonplan/${this.getId.bind(this)()}`}><Button>Open</Button></Link>

                        {Meteor.userId()?<Button onClick = {()=>{

                        const confirmation = confirm('Are you sure you want to fork this lesson?')
                                                    
                        if(!confirmation)
                            return

                        Meteor.call('lessonplans.insert', this.state.lessonplan.title, (err, _id) => {

                                if(!Meteor.userId())
                                    return

                                Meteor.call('lessonplans.update', _id, this.state.lessonplan.slides)
                                this.setState({lessonplan:null})
                                confirm('Lesson has been succesfully forked')                                               

                            })
                        }}><FaCodeFork/>
                        Fork
                        </Button>:null}
                        
                        <Button onClick = {()=>{this.setState({lessonplan:null})}}>X</Button>
                        </div>
                    </Modal.Header>
                    <Modal.Content>                      
                        <LessonPlanViewer _id = {this.getId.bind(this)()}/>
                        <h3>{`Author: ${this.state.username}`}</h3>
                    </Modal.Content>
                </Modal>
                <Input ref = {e => this.searchTag = e} onChange = {this.search.bind(this)} label = 'search'/>
                <div style = {{width:'100%', height:'100%', marginTop:'1.2rem'}}  selection verticalAlign='middle'>
                    {this.displayLessonPlans()}
                </div>
            </div>
        )
    }
}