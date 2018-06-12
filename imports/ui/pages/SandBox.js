import React, { Component } from 'react';
import SortableTree, { addNodeUnderParent, removeNodeAtPath } from 'react-sortable-tree';
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import 'react-sortable-tree/style.css';
import { Directories } from '../../api/directories'
import {LessonPlans} from '../../api/lessonplans'

export default class Tree extends Component {

  constructor(props) {
    super(props)

    this.state = {
        
      treeData: []
    }
  }

  componentDidMount() {

      Meteor.subscribe('directories')
      Meteor.subscribe('lessonplans')

      this.directoryTracker = Tracker.autorun(()=>{
        
        const data = Directories.findOne(Meteor.userId())
        const lessonplans = LessonPlans.find().fetch()

        
        if(data) {

            const treeData = []
            


            treeData.push(...data.directories)
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

    const structs = lessonplans.map(lessonplan => {

        if(lessonplan.isAdded == false)
            return {
                _id: lessonplan._id,
                title: lessonplan.name,
                isFile: true
            }
        else return null

    })

    return structs.filter(struct=>{
        if(struct)
            return struct
    })


  }

  addNewDirectory(e) {   

    e.preventDefault()

    const newDirectory = {
        _id: Math.random().toString(36).substr(2, 16),
        title: this.directoryName.value,
        children: [],
        isFile:false
    }

    this.setState(prevState => {
        return {
            treeData: prevState.treeData.concat(newDirectory)
        }
    },()=>{

        const {treeData} = this.state

        const hello = treeData.filter(data => {

            if(typeof data == 'array') {
                return data
            }
            else {
                if(!data.isFile)
                    return data
            }   

        })

        Meteor.call('directories.update', Meteor.userId(), hello)

    })

    this.directoryName.value = ''


  }

  render() {

    const getNodeKey = ({ treeIndex }) => treeIndex;

    
    const canDrop = ({ node, nextParent, prevPath, nextPath }) => {
  
        if (node.isFile && nextParent && nextParent.isFile) {
          return false;
        }
  
        if (!node.isFile && nextParent && nextParent.isFile) {
            return false;
        }
  
        return true;
      }

    return (
      <div style={{ height: 400 }}>

        <form onSubmit = {this.addNewDirectory.bind(this)}>
            <input ref = {e => this.directoryName = e}/>
            <button>New directory</button>
        </form>

        <SortableTree

            canDrop={canDrop}

            treeData={this.state.treeData}

            onChange={treeData => this.setState({ treeData })}

            onMoveNode = { args => {

                    console.log(args)

                    if(args.node.isFile) {

                        if(args.nextParentNode) {

                            Meteor.call('lessonplans.directoryChange', args.node._id, true)
                        }
                        else {

                            Meteor.call('lessonplans.directoryChange', args.node._id, false)
                        }
                    }
                    
                    const {treeData} = this.state

                    const hello = treeData.filter(data => {

                        if(typeof data == 'array') {
                            return data
                        }
                        else {
                            if(!data.isFile)
                                return data
                        }   

                    })

                    Meteor.call('directories.update', Meteor.userId(), hello)               
                }             
            }

        />
      </div>
    );
  }
}