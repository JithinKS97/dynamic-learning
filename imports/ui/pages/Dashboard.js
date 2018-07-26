import React from 'react'
import LessonPlansDirectories from '../components/LessonPlansDirectories'
import RequestsList from '../components/RequestsList'
import SimsDirectories from '../components/SimsDirectories'
import SharedLessons from '../components/SharedLessons'
import LessonsDirectories from '../components/LessonsDirectories'
import SideBar from '../components/SideBar'
import { Accounts } from 'meteor/accounts-base'
import SimPreview from '../components/SimPreview'
import { Sims } from '../../api/sims'
import { Tab } from 'semantic-ui-react'
import { Tracker } from 'meteor/tracker'
import SharedLessonPlans from '../components/SharedLessonPlans'
import { Grid, Button, Modal, Checkbox, Label, Header } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import FaCode from 'react-icons/lib/fa/code'
import TagsInput from 'react-tagsinput'

/*
    This is the Component which renders the dashboard of the application.
 */
 
export default class Dashboard extends React.Component {

    /*
        node holds the value of the currently selected sim, modelOpen is used to set the open status of the model
        which displays the sim, isPublic holds the value in the checkbox which decides whether the simuation is
        shared with the other users, editable is turned active when the title is editable.

        Title holds the title of the selected simulation and tags holds the search tags of the selected simulation.
     */

    constructor(props) {

        super(props)

        this.state = {
            node:null,
            modelOpen:false,
            isPublic:null,
            editable:false,
            title:'',
            tags:[]
        }
        
        this.renderOption.bind(this)

    }

    componentDidMount() {

        this.simsTracker = Tracker.autorun(()=>{

            /* This code is for ensuring that when title gets updated, then new data is fetched from the database
                and set to state so that the new title value is rendered after its update.
            */

            if(this.state.node) {

                const sim = Sims.findOne({_id:this.state.node._id})
                this.setState({
                    node:sim
                })
            }
                
        })
    }

    componentWillUnmount() {

        this.simsTracker.stop()
    }


    getNode(node) {

        /* This function is executed in the SimsDirectories component (See the component, this function is
            passed as a prop to it) whenever a sim node is selected, the selected node is set accepted as
            the argument and set to state.

            The latest title, sharing option and the tags data are fetched from the database and set to the state.
        ) */

        this.setState({
            node
        },()=>{
            const sim = Sims.findOne({_id:node._id})
            this.setState({
                node:sim,
                isPublic: sim.isPublic,
                title:node.title,
                tags:node.tags
            })
            
        })
    }

    renderOption() {

        /*  Panes is an array which holds the content to display under each tab.
            The first one is the LessonPlan directories and the second one is shared lessonplans list.
         */

        const panes = [
            { menuItem: 'My lessonplans', render: () => <Tab.Pane style = {{height:'720px'}}> <LessonPlansDirectories/></Tab.Pane> },
            { menuItem: 'Shared lessonplans', render: () => <Tab.Pane style = {{height:'720px'}}><SharedLessonPlans/></Tab.Pane> },
        ]        

       const option = this.props.match.params.option

       /* The components are rendered depending upon the selection in the menu */

       switch(option) {
           
            case 'lessonplans':
                return <div>
                            <Header>Manage Lessonplans</Header>
                            <Tab panes = {panes}/>
                        </div>

            case 'requests':
                return <RequestsList/>

            case 'uploadsim':
                return <div>
                            <Header>Manage simulations</Header>
                            <SimsDirectories height = {720} getNode = {this.getNode.bind(this)} isPreview = {false}/>
                        </div>
            case 'lessons':
                    return <div>
                                <Header>Manage Lessons</Header>
                                <LessonsDirectories/>
                            </div>
            case 'watchlesson':
                    return (
                        <div>
                            <Header>Dynamic Lessons</Header>
                            <SharedLessons/>
                        </div>
                    )
       }
    }

    handleClose = () => this.setState({node:null, editable:false})  

    editTitle() {

        if(this.state.editable == false) {
            
           this.setState({editable:true})
        }
        else {

            if(this.title.value === '') {
                this.setState({editable:false})
                return
            }
                

            Meteor.call('sims.titleChange', this.state.node._id, this.state.title)
            this.setState({editable:false})
        }
    }

    handleTagsInput(tags) {

        this.setState({tags},()=>{

            Meteor.call('sims.tagsChange', this.state.node._id, tags)
        })
    }

    render() {
        return(
            <div style = {{height:'100vh'}}>                   

                <Modal
                    closeOnRootNodeClick={false}                
                    style = {{width:'auto'}}
                    open={!!this.state.node}
                    onClose={this.handleClose}
                    size='tiny'            
                >
                    <Modal.Header>
                        Preview
                        <Button className = 'close-button' onClick = {this.handleClose}>
                            X
                        </Button> 
                    </Modal.Header>

                    <Modal.Content>
                        <Modal.Description>                        
                            <SimPreview {...this.state.node}/>                        
                            <br/>
                
                            {this.state.editable?null:<Label style = {{padding:'0.8rem', width:'18rem', textAlign:'center'}}><h4>{this.state.node?this.state.title:null}</h4></Label>}
                            {this.state.editable?<input ref = {e=>this.title = e} onChange = {()=>{this.setState({title:this.title.value})}} style = {{padding:'0.8rem', width:'18rem'}} ref = {e => this.title = e}/>:null}
                            <Button onClick = {this.editTitle.bind(this)} style = {{marginLeft:'0.8rem'}}>{this.state.editable?'Submit':'Edit title'}</Button>
                            <a style = {{marginLeft:'0.8rem'}}className = 'link-to-code' target = '_blank' href = {this.state.node?this.state.node.linkToCode:''}><Button><FaCode/></Button></a> 
                        </Modal.Description>
                        <Modal.Description>  
                            <Checkbox 
                                style = {{margin:'0.8rem 0'}}
                                checked = {this.state.isPublic}
                                ref = {e => this.checkbox = e }
                                onChange = {()=>{

                                    Meteor.call('sims.visibilityChange', this.state.node._id, !this.checkbox.state.checked)
                                    this.setState({
                                        isPublic: !this.checkbox.state.checked
                                    })      

                            }} label = 'Share with others'/>
                            {this.state.isPublic?<TagsInput value={this.state.tags} onChange={this.handleTagsInput.bind(this)} />:null}
                        </Modal.Description>
                    </Modal.Content>         

                </Modal>               

                <Grid  columns={3} divided>
                    <Grid.Row>                        
                        <Grid.Column width = {3} style = {{margin:'1.6rem'}}>
                        <Button onClick = {()=>{Accounts.logout()}}>Log out</Button>
                            <SideBar/> 
                        </Grid.Column>
                        <Grid.Column width = {10} style = {{margin:'1.6rem'}}>
                            {this.renderOption()}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                
            </div>
        )
    }
}



