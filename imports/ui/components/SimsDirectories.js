import React from 'react'
import Upload from '../components/Upload'
import { Meteor } from 'meteor/meteor'
import SortableTree, { removeNodeAtPath } from 'react-sortable-tree';
import 'react-sortable-tree/style.css'; 
import { Tracker } from 'meteor/tracker'
import { Directories } from '../../api/directories'
import { Sims } from '../../api/sims'

import IoEye from 'react-icons/lib/io/eye'
import FaTrash from 'react-icons/lib/fa/trash'

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
          };

    }

    componentDidMount() {

        Meteor.subscribe('sims')
        Meteor.subscribe('directories')

        this.simsTracker = Tracker.autorun(()=>{

            const data = Directories.findOne()
            const sims = Sims.find({userId: Meteor.userId()}).fetch()



            if(data) {

                const treeData = []       

                /*The treeData is retrieved and the lessonplan objects which are outside the
                    file structure is obtained as file objects.
                */
    
                treeData.push(...data.simDirectories)
                treeData.push(...this.getFileObjects(sims)) 

                this.setState({
                    treeData
                })
            }           
            
        })

    }

    componentWillUnmount() {
        
        this.simsTracker.stop()
    }

    getFileObjects(sims) {

        /* If the lessonplan is not added into the file structure yet. It is made into
            an object which contains its _id, title. The resulting array will contain
            null values as elements.
        */
    
        const structs = sims.map(sim => {
    
            if(sim.isAdded == false)
                return {
                    _id: sim._id,
                    title: sim.name,
                    isFile: true,
                    src:sim.src,
                    w:sim.w,
                    h:sim.h
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
    
        const newDirectory = {
    
            title: this.folderName.value,
            children: [],
            isFile:false
        }
    
        if(!this.folderName.value)
            return
    
        this.setState(prevState => {
            return {
                treeData: prevState.treeData.concat(newDirectory)
            }
        },()=>{

            const outSideFilesRemoved = this.removeOutsideFiles()
            Meteor.call('simDirectories.update', Meteor.userId(), outSideFilesRemoved)

        })
      
        this.handleClose()
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

    handleOpen = () => this.setState({ modalOpen: true })
    handleClose = () => this.setState({ modalOpen: false })   
    
    
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

        const removeSim = node => {

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
                    removeSim(child)
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
                                
                                <Button onClick = {this.handleClose}>
                                    Close
                                </Button>

                            </Form>
                        </Modal.Description>
                        
                    </Modal.Content>             

                </Modal>

                <div style={{ height: 400, padding:'1.6rem' }}>

                    <SortableTree
                        theme={FileExplorerTheme}
                        treeData={this.state.treeData}
                        onChange={treeData => this.setState({ treeData })}
                        canDrop={canDrop}
                        onMoveNode = { args => {

                            if(args.node.isFile) {

                                /*When a file is moved within the directory structure, we check
                                    whether it has come to the root directory. If args.nextParentNode
                                    is null, it is outsude, otherwise it is inside.
                                */
        
                                if(args.nextParentNode) {

        
                                    Meteor.call('sims.directoryChange', args.node._id, true)
                                }
                                else {
                                    

                                    Meteor.call('sims.directoryChange', args.node._id, false)
                                }
                            }
                            
                            const outSideFilesRemoved = this.removeOutsideFiles()
                            Meteor.call('simDirectories.update', Meteor.userId(), outSideFilesRemoved)
         
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
                            <IoEye size={22} color="black"/>
                          </button>,
        
                          <button
                          
                            style = {{visibility: this.props.isPreview?'hidden':'visible'}}
                            className = 'icon__button'
                            onClick={() =>{
        
                              const input = confirm('Are you sure you want to perform this deletion?')
                              if(!input)
                                return
        
                              if(!node.isFile) {
                                removeSim(node)
                              }
                              else {
        
                                Meteor.call('sims.remove', node._id)
                              }
                                
                              this.setState(state => ({                          
                                treeData: removeNodeAtPath({
                                  treeData: state.treeData,
                                  path,
                                  getNodeKey,
                                }),
                              }),()=>{
        
                                const outSideFilesRemoved = this.removeOutsideFiles()
                        
                                Meteor.call('simDirectories.update', Meteor.userId(), outSideFilesRemoved)
        
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