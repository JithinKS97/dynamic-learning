import React, { Component } from 'react';
import SortableTree, { getTreeFromFlatData }  from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import { Button, Modal, Form, Dimmer, Loader } from 'semantic-ui-react'
import 'react-sortable-tree/style.css';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';
import 'semantic-ui-css/semantic.min.css';
import { Tracker } from 'meteor/tracker'
import { Lessons } from '../../api/lessons'
import FaTrash from 'react-icons/lib/fa/trash'
import FaEdit from 'react-icons/lib/fa/edit'
import {Redirect} from 'react-router-dom'

export default class Tree extends Component {

  constructor(props) {
    super(props);

    this.state = {

      treeData: [],
      isOpen: false,
      title:'',
      toCreate:null,
      loading:true,
      selectedLessonId:null,
      redirectToLesson:false
    }
  }

  componentDidMount() {

    this.lessonsTracker = Tracker.autorun(()=>{


        const lessonsHandle = Meteor.subscribe('lessons')
        const loading = !lessonsHandle.ready()
        const flatData = Lessons.find({userId:Meteor.userId()}).fetch()

        const getKey = node => node._id
        const getParentKey = node => node.parent_id
        const rootKey = '0'        

        const treeData = getTreeFromFlatData({
            flatData,
            getKey,
            getParentKey,
            rootKey
        })

        this.setState({

            treeData,
            loading        
        })
    })
  }

  componentWillUnmount() {

    this.lessonsTracker.stop()
  }

  handleSubmit() {

    if(!this.state.title) {

        this.setState({
            toCreate:null,
        })
        return
    }
    else {

        if(this.state.toCreate == 'file')
            Meteor.call('lessons.insert', this.state.title)
        else
            Meteor.call('lessons.folder.insert', this.state.title)

        this.setState({

            isOpen:false,
            title:null
        })
    }
  }


  render() {

    const removeLessonPlansInside = node => {

        /* The deletion takes place recursively.
            If the node is a file, using the id in it, it is removed
            from the database.
            If the node has no children, returned otherwise
            we recursively move to the children nodes.
        */

        if(node.isFile) {

            Meteor.call('lessons.remove', node._id)
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

    if(this.state.redirectToLesson == true)
        return <Redirect to = {`/lesson/${this.state.selectedLessonId}`}/>
    return (

    <div>
        <Dimmer inverted active = {this.state.loading}>
            <Loader />
        </Dimmer>

        <Modal size = 'tiny' open = {this.state.isOpen}>

            <Modal.Header>

                Enter the title
                <Button className = 'close-button' onClick = {()=>{

                    this.setState({

                        isOpen:false
                    })
                }}>X</Button>
            </Modal.Header>

            <Modal.Content>
                <Form onSubmit = {this.handleSubmit.bind(this)}>
                    <Form.Field>
                        <label>Title</label>
                        <input ref = {(e)=>this.title=e} onChange = {()=>{

                            this.setState({
                                title:this.title.value
                            })
                        }}/>
                    </Form.Field>
                    <Form.Field>
                        <Button type = 'submit'>Submit</Button>
                    </Form.Field>
                </Form>
            </Modal.Content>
        </Modal>

        <Button onClick = {()=>{
            this.setState({

                isOpen: true,
                toCreate:'file'
            })
        }}>Create new dynamic lesson</Button>

        <Button onClick = {()=>{

            this.setState({

                isOpen: true,
                toCreate:'folder'
            })
        }}>Create a folder</Button>

        <div style={{ height: window.innerHeight - 150, padding:'1.6rem' }}>

            <SortableTree

                theme = {FileExplorerTheme}

                generateNodeProps = {({node})=>({
                    buttons:[

                        <button
                            onClick = {()=>{
                                this.setState({
                                    selectedLessonId:node._id
                                },()=>{
                                    this.setState({
                                        redirectToLesson:true
                                    })
                                })
                            }}
                            className = 'icon__button'
                            style = {{display:node.isFile?'block':'none'}}
                        >

     
                           <FaEdit size={17} color="black" />

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
                                    
                                    Meteor.call('lessons.remove', node._id)
                                }
                            }                        
                        >
                            
                            <FaTrash size={17} color="black"/>
                        </button>
                    ]
                })}
                canDrop={canDrop}  
                treeData={this.state.treeData}
                onChange={treeData => this.setState({ treeData })}
                onMoveNode = { args => {

                        if(args.nextParentNode) {
                            
                            Meteor.call('lessons.directoryChange', args.node._id, args.nextParentNode._id)
                            Meteor.call('lessons.folder.visibilityChange', args.nextParentNode._id, true)
                        }
                        else {

                            Meteor.call('lessons.directoryChange', args.node._id, '0')
                        }             
                    }             
                }
            />
        </div>

    </div>
    );
  }
}