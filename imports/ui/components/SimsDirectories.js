import React from 'react'
import Upload from '../components/Upload'
import { Meteor } from 'meteor/meteor'
import SortableTree, { getTreeFromFlatData } from 'react-sortable-tree';
import 'react-sortable-tree/style.css'; 
import { Tracker } from 'meteor/tracker'
import { Sims } from '../../api/sims'

import FaTrash from 'react-icons/lib/fa/trash'

import FaPlayCircleO from 'react-icons/lib/fa/play-circle-o'


import { Button, Modal, Form} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';

export default class SimsDirectories extends React.Component {

    constructor(props) {

        super(props)

        this.state = {
            treeData: [],
            node:null,
            modelOpen:false
          }

    }

    componentDidMount() {

        Meteor.subscribe('sims')

        this.simsTracker = Tracker.autorun(()=>{

            const flatData = Sims.find({userId: Meteor.userId()}).fetch()
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
                treeData
            })
          
            
        })

    }

    componentWillUnmount() {
        
        this.simsTracker.stop()
    }


    addNewFolder(e) {   

        e.preventDefault()
    
        /* New directory is created here.*/

        if(!this.folderName.value)
            return
    
        Meteor.call('sims.folder.insert', this.folderName.value)
      
        this.handleClose()
        this.folderName.value = ''
    
     }

    handleOpen = () => this.setState({ modalOpen: true })
    handleClose = () => this.setState({ modalOpen: false })    
    
    render() {  

        const canDrop = ({ node, nextParent, prevPath, nextPath }) => {

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

        const removeSimsInside = node => {

            /* The deletion takes place recursively.
                If the node is a file, using the id in it, it is removed
                from the database.
    
                If the node has no children, returned otherwise
                we recursively move to the children nodes.
            */
    
            if(node.isFile) {
    
                Meteor.call('sims.remove', node._id)
                return
                
            }
    
            if(node.children.length == 0) {
                return
            }
            else {
                node.children.map(child => {
                    removeSimsInside(child)
                })
            }      
        }    
        
        return(
            <div>

                <Upload isPreview = {this.props.isPreview} methodToRun = 'sims.insert' />

                <Modal
                
                    trigger = {this.props.isPreview?null:<Button onClick={this.handleOpen} >Create a folder</Button>}
                    open={this.state.modalOpen}
                    onClose={this.handleClose}
                    size='tiny'            
                    >
                    <Modal.Header>
                        New folder
                        <Button className = 'close-button' onClick = {this.handleClose}>
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
                        onVisibilityToggle = {({treeData, node, expanded}) => {
                            Meteor.call('sims.folder.visibilityChange', node._id, expanded)
                        }}
                        theme= {FileExplorerTheme}
                        canDrag = {this.props.isPreview?false:true}
                        treeData={this.state.treeData}
                        onChange={treeData => this.setState({ treeData })}
                        canDrop={canDrop}
                        onMoveNode = { args => {
                            
                            if(args.nextParentNode) {
                                Meteor.call('sims.folder.visibilityChange', args.nextParentNode._id, true)
                                Meteor.call('sims.folderChange', args.node._id, args.nextParentNode._id)
                            }
                            else {

                                Meteor.call('sims.folderChange', args.node._id, '0')
                            } 

                        }
                    }


                    generateNodeProps={({ node, path }) => ({
                        buttons: [

                          <button
                            
                            className = 'icon__button'
                            style = {{
                                visibility:node.isFile?'visible':'hidden'
                            
                            }}
                            onClick = {()=>{
                                
                                this.setState({isOpen:true, node},()=>{
                                    this.props.getNode(this.state.node)
                                })                            
                            
                            }} 
                            >
                            <FaPlayCircleO size={22} color="black"/>
                          </button>,
        
                          <button
                          
                            style = {{visibility: this.props.isPreview?'hidden':'visible'}}
                            className = 'icon__button'
                            onClick={() =>{
        
                                const input = confirm('Are you sure you want to perform this deletion?')
                                if(!input)
                                    return
            
                                if(!node.isFile) {
                                    removeSimsInside(node)
                                }

                                Meteor.call('sims.remove', node._id)                                
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