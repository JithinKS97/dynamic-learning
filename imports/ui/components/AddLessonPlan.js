import React from 'react'
import { LessonPlans } from '../../api/lessonplans'
import { Requests } from '../../api/requests'
import { Meteor } from 'meteor/meteor'
import Modal from 'react-modal'

export default class AddLessonPlans extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            name:'',
            isOpen:false
        }
    }

    render() {
        return (
            
            <div>
                <button className = 'button' onClick = {()=>{
                    this.setState({
                        isOpen:true
                    })
                }}>+ New Lessonplan</button>

                <Modal isOpen = {this.state.isOpen} ariaHideApp={false}>
                <form onSubmit = {(e)=>{

                    e.preventDefault()

                    Meteor.call('lessonplans.insert', this.state.name)                    

                    this.setState({
                        name:'',
                        isOpen:false
                    })

                }}>
                    <input onChange = {()=>{
                        this.setState({
                            name: this.name.value
                        })
                    }} type = 'text' ref = {e => this.name = e} value = {this.state.name} placeholder = 'Name'/>

                    {this.state.name?<button>Add</button>:<button disabled >Add</button>}
                    
                </form>
                <button onClick = {()=>{
                    this.setState({
                        isOpen:false,
                        name:''
                    })
                }}>Cancel</button>
                </Modal>
            </div>
        )
    }
}