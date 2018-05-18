import React from 'react'
import { Sims } from  '../api/sims'
import { Meteor } from 'meteor/meteor'
import SimContainer from './SimContainer'
import Modal from 'react-modal'
 

export default class Upload extends React.Component {

    constructor(props) {
        
        super(props)
        this.state = {
            src:'',
            error:'',
            isOpen: false
        }
        this.submitButton.bind(this)
    }

    componentDidMount() {
        Meteor.subscribe('sims')
    }
    
    enteredLink(e) {
        
        e.preventDefault()
        let link = this.refs.sim.value
        this.setState({
            error:link
        })
        const tag = link.match(`(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))`)
        if(tag) {
            const validTag = tag[0]
            const src = validTag.match(`src\s*=\s*"\s*(.*)\s*">`)
            if(src) {
                validSrc = src[1]
                this.setState({
                    src:validSrc
                })
            }
            else {
                this.setState({
                    src:''
                })
            }
        }
        else {
            this.setState({
                src:''
            })
        }
    }

    submitButton() {

        if(this.state.src) {
            return (
                <div>                    
                    <p>Name of the simulation</p>
                    <input ref='name' onChange = {()=>{this.setState({name:this.refs.name.value})}}/>              
                        
                            <button onClick = {(e)=>{
                            e.preventDefault()
                            let iframe = this.state.src
                            let name = this.refs.name.value
                            if(name) {
                                
                                this.props.methodName()
                                
                            }                                                                        
                            }}>Submit</button>                
                </div>
            )
        }
        else return null
    }
    
    render() {
        
        return(
            <div>
            <button onClick = {()=>this.setState({isOpen:true})}>Add Simulation</button>        
            <Modal isOpen = {this.state.isOpen} ariaHideApp={false}>
                <form>
                    <h1>Submit simulation</h1>
                    <p>Enter the Iframe tag</p>
                    <input onChange={this.enteredLink.bind(this)} ref = 'sim'/>
                    <SimContainer src = {this.state.src}/>
                    <div>{this.submitButton()}</div>
                </form>
                <button onClick = {()=>this.setState({isOpen:false})}>Cancel</button>   
            </Modal>
            </div>
        )
    }
}