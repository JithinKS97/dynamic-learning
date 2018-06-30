import React from 'react'
import { LessonPlans } from '../../api/lessonplans'
import { List, Modal,Button } from 'semantic-ui-react'
import LessonPlanViewer from './LessonPlanViewer'

import FaCodeFork from 'react-icons/lib/fa/code-fork'

 
export default class SharedLessonPlans extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            lessonplans:[],
            lessonplan:null
        }
        this.displayLessonPlans.bind(this)
    }

    componentDidMount() {

         Meteor.subscribe('lessonplans.public')
         this.lessonplansTracker = Tracker.autorun(()=>{

            const lessonplans = LessonPlans.find({isPublic:true}).fetch()
            this.setState({
                lessonplans,
                selectedLessonPlan:null
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
                    })
                }}>
                    <List.Content onClick = {()=>{this.setState({lessonplan})}}>    
                        {lessonplan.title}
                    </List.Content>
                </List.Item>
            )
        })

    }



    render() {

        return(
            <div>
                <Modal 
                    open = {this.state.lessonplan}
                    size = 'fullscreen'
                    style = {{transform: 'scale(0.83, 0.83)', marginTop:'8rem'}}
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
                        </Button>
                        <Button onClick = {()=>{this.setState({lessonplan:null})}}>X</Button>
                        </div>
                    </Modal.Header>
                    <Modal.Content>                      
                        <LessonPlanViewer _id = {this.state.lessonplan?this.state.lessonplan._id:null}/>
                    </Modal.Content>
               </Modal>
                <List style = {{width:'100%', height:'100%'}}  selection verticalAlign='middle'>
                    {this.displayLessonPlans()}
                </List>
            </div>
        )
    }
}