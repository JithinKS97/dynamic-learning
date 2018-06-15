import React, { Component } from 'react';
import SortableTree, { addNodeUnderParent, removeNodeAtPath } from 'react-sortable-tree';
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import 'react-sortable-tree/style.css';
import { Directories } from '../../api/directories'
import { LessonPlans } from '../../api/lessonplans'
import { Link } from 'react-router-dom'

import { Button, Modal, Form} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import FaTrash from 'react-icons/lib/fa/trash'
import FaEdit from 'react-icons/lib/io/edit'
 

/*This component displays the lessonplan files in nested tree structure.
    You will be able to create directories and add lessonplans to it.
    Deletion of a directory will result in the deletion of all the directories in it
    along with the lessonplans in all of the nested directories 
    and the main directory.
*/

export default class LessonPlansDirectories extends Component {

  constructor(props) {
    super(props)

    this.state = {
        
      treeData: [],
      modalOpen: false,
      modal2Open:false
    }

    this.removeOutsideFiles.bind(this)
  }

  componentDidMount() {

      Meteor.subscribe('directories')
      Meteor.subscribe('lessonplans')

      this.directoryTracker = Tracker.autorun(()=>{
        
        const data = Directories.findOne(Meteor.userId())
        const lessonplans = LessonPlans.find().fetch()

        /* Here we fetch two things, all the lessonplans and all directory data */
        
        if(data) {

            const treeData = []       

            /*The treeData is retrieved and the lessonplan objects which are outside the
                file structure is obtained as file objects.
            */

            treeData.push(...data.lessonPlanDirectories)
            treeData.push(...this.getFileObjects(lessonplans)) 

            this.setState({
                treeData
            })

        }     
    })
  }

  componentWillUnmount() {
    this.directoryTracker.stop()
  }

  getFileObjects(lessonplans) {

    /* If the lessonplan is not added into the file structure yet. It is made into
        an object which contains its _id, title. The resulting array will contain
        null values as elements.
    */

    const structs = lessonplans.map(lessonplan => {

        if(lessonplan.isAdded == false)
            return {
                _id: lessonplan._id,
                title: lessonplan.name,
                isFile: true
            }
        else return null

    })

    /* The null values are filtered out from the array*/

    return structs.filter(struct=>{
        if(struct)
            return struct
    })


  }

  addNewFolder(e) {   

    e.preventDefault()
    
    /* New directory is created here.*/

    if(!this.folderName.value)
        return

    this.handle2Close()

    const newDirectory = {

        title: this.folderName.value,
        children: [],
        isFile:false
    }

    this.setState(prevState => {
        return {
            treeData: prevState.treeData.concat(newDirectory)
        }
    },()=>{

        const outSideFilesRemoved = this.removeOutsideFiles()

        Meteor.call('lessonPlanDirectories.update', Meteor.userId(), outSideFilesRemoved)

    })  

    this.folderName.value = ''


  }

  removeOutsideFiles() {

    const {treeData} = this.state

    /* The files which are not yet added to the directory are removed and then
        the database is updated
    */

    return treeData.filter(data => {

        if(typeof data == 'array') {
            return data
        }
        else {
            if(!data.isFile)
                return data
        }
    })

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

  render() {


    const getNodeKey = ({ treeIndex }) => treeIndex;
    
    const canDrop = ({ node, nextParent, prevPath, nextPath }) => {

        /* To prevent a file to be added as a child of a file 
            and to prevent a directory to be added as a child of a file.
        */
  
        if (node.isFile && nextParent && nextParent.isFile) {
          return false;
        }
  
        if (!node.isFile && nextParent && nextParent.isFile) {
            return false;
        }
  
        return true;
    }

    const removeLessonPlan = node => {

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
                removeLessonPlan(child)
            })
        }        

    }

    return ( 

        <div>   

             <Modal 

                trigger = {<Button onClick={this.handleOpen} >Create new lessonplan</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}
                size='tiny'            
             >
                <Modal.Header>Lessonplan details</Modal.Header>

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

                            <Button onClick = {this.handleClose}>
                                Close
                            </Button>
                       
                        </Form>
                    </Modal.Description>
                    
                </Modal.Content>              

            </Modal>


             <Modal 

                trigger = {<Button onClick={this.handle2Open} >Create a folder</Button>}
                open={this.state.modal2Open}
                onClose={this.handle2Close}
                size='tiny'            
                >
                <Modal.Header>New folder</Modal.Header>

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

                            <Button onClick = {this.handle2Close}>
                                Close
                            </Button>
                    
                        </Form>
                    </Modal.Description>
                    
                </Modal.Content>              

                </Modal>

            <div style={{ height: 400, padding:'1.6rem' }}>        
                
                <SortableTree 
             
                    canDrop={canDrop}                    
                    treeData={this.state.treeData}
                    onChange={treeData => this.setState({ treeData })}
                    onMoveNode = { args => {

                            if(args.node.isFile) {

                                /*When a file is moved within the directory structure, we check
                                    whether it has come to the root directory. If args.nextParentNode
                                    is null, it is outsude, otherwise it is inside.
                                */

                                if(args.nextParentNode) {

                                    Meteor.call('lessonplans.directoryChange', args.node._id, true)
                                }
                                else {

                                    Meteor.call('lessonplans.directoryChange', args.node._id, false)
                                }
                            }
                            
                            const outSideFilesRemoved = this.removeOutsideFiles()

                            Meteor.call('lessonPlanDirectories.update', Meteor.userId(), outSideFilesRemoved)               
                        }             
                    }

                    generateNodeProps={({ node, path }) => ({
                        buttons: [

                        <button
                            
                            className = 'icon__button'
                            style = {{visibility:node.isFile?'visible':'hidden'}}>

                            <Link to ={{ pathname: `/createlessonplan/${node._id}`}}>
                               <FaEdit size={17} color="black" />
                            </Link>

                        </button>,

                        <button
                        
                            className = 'icon__button'
                            onClick={() =>{

                            const input = confirm('Are you sure you want to perform this deletion?')
                            if(!input)
                                return

                            if(!node.isFile) {
                                removeLessonPlan(node)
                            }
                            else {

                                Meteor.call('lessonplans.remove', node._id)
                            }
                                
                            this.setState(state => ({                          
                                treeData: removeNodeAtPath({
                                treeData: state.treeData,
                                path,
                                getNodeKey,
                                }),
                            }),()=>{

                                const outSideFilesRemoved = this.removeOutsideFiles()
                        
                                Meteor.call('lessonPlanDirectories.update', Meteor.userId(), outSideFilesRemoved)

                            })}
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