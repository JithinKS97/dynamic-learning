import React, { Component } from 'react';
import SortableTree, { getTreeFromFlatData} from 'react-sortable-tree';
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data';
import 'react-sortable-tree/style.css';
import { LessonPlans } from '../../api/lessonplans'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router-dom'

import { Button, Modal, Form, Label, Checkbox, Dimmer, Loader } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import FaTrash from 'react-icons/lib/fa/trash'
import FaEdit from 'react-icons/lib/fa/edit'

import MdSettings from 'react-icons/lib/md/settings'
import LessonPlanViewer from './LessonPlanViewer'

import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import TagsInput from 'react-tagsinput'
 

/*This component displays the lessonplan files in nested tree structure.
    You will be able to create directories and add lessonplans to it.
    Deletion of a directory will result in the deletion of all the directories in it
    along with the lessonplans in all of the nested directories 
    and the main directory.
*/

class LessonPlansDirectories extends Component {

  constructor(props) {
    super(props)

    this.state = {
        
      modalOpen: false,
      modal2Open: false,
      selectedLessonPlanId: null,
      node:null,
      editable:false,
      title:null,
      isPublic:null,
      tags:[],
      redirectToLessonPlan:false
    }
    
  }

  addNewFolder(e) {   

    e.preventDefault()
    
    /* New directory is created here.*/

    if(!this.folderName.value)
        return

    this.handle2Close()

    Meteor.call('lessonplans.folder.insert', this.folderName.value)

    this.folderName.value = ''

  }


  addNewLessonPlan() {

    if(!this.lessonPlanName.value)
        return

    this.handleClose()

    Meteor.call('lessonplans.insert', this.lessonPlanName.value) 

    this.lessonPlanName.value = ''

  }

  handleOpen = () => this.setState({ modalOpen: true })
  handleClose = () => this.setState({ modalOpen: false })

  handle2Open = () => this.setState({ modal2Open: true })
  handle2Close = () => this.setState({ modal2Open: false })

  editTitle() {
    
    if(!this.title && this.state.editable == true)
        return

    if(this.state.editable == true) {

        if(!this.title.value) {
            this.setState({
                editable:false
            })
            return
        }

        Meteor.call('lessonplans.updateTitle', this.state.selectedLessonPlanId, this.title.value)

        this.setState({
            editable: false,
            title:this.title.value
        })
    }    
    else {
        this.setState({
            editable: true
        })
    }
  }

  handleTagsInput(tags) {

    this.setState({tags},()=>{

        Meteor.call('lessonplans.tagsChange', this.state.node._id, tags)
    })
  }

    
  

  render() {    

    const getNodeKey = ({ treeIndex }) => treeIndex;
    
    const canDrop = ({ node, nextParent }) => {

        /* To prevent a file to be added as a child of a file 
            and to prevent a directory to be added as a child of a file.
        */
  
        if (node && nextParent) {
            if(node.isFile && nextParent.isFile)
                return false
        }
  
        if (node && nextParent) {
            if(!node.isFile && nextParent.isFile)
                return false
        }
  
        return true;
    }

    const removeLessonPlansInside = node => {

        /* The deletion takes place recursively.
            If the node is a file, using the id in it, it is removed
            from the database.
            If the node has no children, returned otherwise
            we recursively move to the children nodes.
        */

        if(node.isFile) {

            Meteor.call('lessonplans.remove', node._id)
            return            
        }

        if(node.children.length == 0) {
            return
        }
        else {
            node.children.map(child => {
                removeLessonPlansInside(child)
            })
        }
    }

    if(this.state.redirectToLessonPlan == true)
        return <Redirect to = {`/createlessonplan/${this.state.selectedLessonPlanId}`} />

    

    return ( 

        <div>

        <Dimmer inverted active = {!this.props.lessonplansExists}>
            <Loader />
        </Dimmer>
            
             <Modal 
                trigger = {<Button onClick={this.handleOpen} >Create new lessonplan</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='tiny'            
             >
                <Modal.Header>
                    Lessonplan details
                    <Button className = 'close-button' onClick = {this.handleClose}>
                        X
                    </Button>
                </Modal.Header>

                <Modal.Content>
                    <Modal.Description>

                        <Form onSubmit = {this.addNewLessonPlan.bind(this)}>

                            <Form.Field>
                                <label>Name</label>
                                <input ref = { e => this.lessonPlanName = e } placeholder='Name' />
                            </Form.Field>
                      
                            <Button type='submit'>
                                Submit
                            </Button>
                       
                        </Form>
                    </Modal.Description>
                    
                </Modal.Content>              

            </Modal>

            <Modal
                size = 'fullscreen'
                open = {!!this.state.selectedLessonPlanId}
                style = {{transform: 'scale(0.73, 0.73)', marginTop:'10rem'}}
            >
                <Modal.Header>
                    Preview        
                    <Button className = 'close-button' style = {{marginLeft:'0.8rem'}} onClick = {()=>{this.setState({selectedLessonPlanId:null, editable:false})}}>X</Button>
                </Modal.Header>
                <Modal.Content>                
                    <Modal.Description>

                        <LessonPlanViewer _id = {this.state.selectedLessonPlanId}/>                  
                                            
                    </Modal.Description>

                    <Modal.Description style = {{padding:'0.8rem 0'}}>
                        {!this.state.editable?<Label style = {{width:'24rem', textAlign:'center', marginTop:'0.8rem'}}>{this.state.node?<h2>{this.state.title}</h2>:null}</Label>:null}
                        {this.state.editable?<input ref = {e => this.title = e} style = {{width:'24rem', padding:'0.8rem'}}/>:null}
                        <Button onClick = {this.editTitle.bind(this)} style = {{marginLeft:'2rem'}}>{this.state.editable?'Submit':'Edit title'}</Button>
                        <br/>
                        <Checkbox
                            style = {{margin:'0.8rem 0'}}
                            label = 'Share with others'
                            checked = {this.state.isPublic}
                            ref = {e => this.checkbox = e }
                            onChange = {()=>{
                                
                                Meteor.call('lessonplans.visibilityChange', this.state.selectedLessonPlanId, !this.checkbox.state.checked)
                                this.setState({
                                    isPublic: !this.checkbox.state.checked
                                }) 
                            }}     
                        />
                        <br/>
                        {this.state.isPublic?<TagsInput value={this.state.tags} onChange={this.handleTagsInput.bind(this)} />:null}
                        
                    </Modal.Description>

                </Modal.Content>
                
            </Modal>


            <Modal 

                trigger = {<Button onClick={this.handle2Open} >Create a folder</Button>}
                open={this.state.modal2Open}
                onClose={this.handle2Close}
                size='tiny'            
            >
                <Modal.Header>
                    New folder
                    <Button className = 'close-button' onClick = {this.handle2Close}>
                        X
                    </Button>                  

                </Modal.Header>

                <Modal.Content>
                    <Modal.Description>

                        <Form onSubmit = {this.addNewFolder.bind(this)}>

                            <Form.Field>
                                <label>Name</label>
                                <input ref = { e => this.folderName = e } placeholder='Name' />
                            </Form.Field>
                    
                            <Button type='submit'>
                                Submit
                            </Button>

                        </Form>
                    </Modal.Description>
                    
                </Modal.Content>              

            </Modal>

            <div style={{ height: 400, padding:'1.6rem' }}>        
                
                <SortableTree
                    onVisibilityToggle = {({ node, expanded}) => {
                        Meteor.call('lessonplans.folder.visibilityChange', node._id, expanded)
                    }}
                    theme = {FileExplorerTheme}
                    canDrop={canDrop}                    
                    treeData={this.props.treeData}
                    onChange={treeData => this.setState({ treeData })}
                    onMoveNode = { args => {

                            if(args.nextParentNode) {
                                
                                Meteor.call('lessonplans.directoryChange', args.node._id, args.nextParentNode._id)
                                Meteor.call('lessonplans.folder.visibilityChange', args.nextParentNode._id, true)
                            }
                            else {

                                Meteor.call('lessonplans.directoryChange', args.node._id, '0')
                            }             
                        }             
                    }

                    generateNodeProps={({ node }) => ({


                        buttons: [

                        <button
                            onClick = {()=>{
                                this.setState({
                                    selectedLessonPlanId: node._id
                                },()=>{
                                    this.setState({
                                        redirectToLessonPlan: true
                                    })
                                })
                            }}                            
                            className = 'icon__button'
                            style = {{display:node.isFile?'block':'none'}}>

                            <FaEdit size={17} color="black" />

                        </button>,
                        
                        <button
                        onClick = {()=>{

                                this.setState({
                                    
                                    node,
                                    selectedLessonPlanId:node._id,
                                    title:node.title,
                                    isPublic:node.isPublic,
                                    tags:node.tags
                                })
                            }}
                            style = {{display:node.isFile?'block':'none'}}
                            className = 'icon__button'
                        >
                            <MdSettings size={17} color="black"/>
                        </button>,

                        <button
                        
                            className = 'icon__button'
                            onClick={() =>{

                                    const input = confirm('Are you sure you want to perform this deletion?')
                                    if(!input)
                                        return

                                    if(!node.isFile) {
                                        removeLessonPlansInside(node)                                
                                    }
                                    
                                    Meteor.call('lessonplans.remove', node._id)
                                }
                            }
                        >
                            <FaTrash size={17} color="black"/>
                            
                        </button>

                        ]
                    })}
                />

            </div>
        </div>
 
    )
  }
}

export default LessonPlansDirectoriesContainer = withTracker(()=>{

    const lessonplansHandle = Meteor.subscribe('lessonplans')
    const loading = !lessonplansHandle.ready()
    const flatData = LessonPlans.find({userId: Meteor.userId()}).fetch()
    const lessonplansExists = !loading && !!flatData

    const getKey = node => node._id
    const getParentKey = node => node.parent_id
    const rootKey = '0'        

    const treeData = getTreeFromFlatData({
        flatData,
        getKey,
        getParentKey,
        rootKey
    })
 

    return {
        lessonplansExists,
        treeData
    }

})(LessonPlansDirectories)
