import React from 'react'
import { Sims } from  '../api/sims'
import { Meteor } from 'meteor/meteor'
import SimContainer from './SimContainer'
import Modal from 'react-modal'
 

export default class Upload extends React.Component {

    /*This component performs the function of uploading the iframe
      src stores the src of the input iframe tag, isOpen is for opening
      and closing of the modal.
    */

    constructor(props) {
        
        super(props)
        this.state = {
            src:'',
            error:'',
            isOpen: false,
            w:null,
            h:null
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

        /* The link.match checks if the iframe entered is valid by using regular
           expression. THe src should be set only if the entered tag is valid.
        */

        const tag = link.match(`(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))`)
        
        if(tag) {
            const validTag = tag[0]

            /* The contents in the src is obtained using regular expression */

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

        /* The iframe is uploaded to the collection in this function. Only if the
           src is valid and a name is provided in the input field, insertions is
           performed.
        */

        if(this.state.src) {
            return (
                <div>                    
                    <p>Name of the simulation
                    <input ref='name' onChange = {()=>{this.setState({name:this.refs.name.value})}}/>
                    </p>
                    <p>
                    Width
                    <input ref='width' onChange = {()=>{this.setState({w:this.refs.width.value})}}/>
                    </p>
                    <p>
                    Height
                    <input ref='height' onChange = {()=>{this.setState({h:this.refs.height.value})}}/>
                    </p>               
                        
                            <button onClick = {(e)=>{

                            e.preventDefault()
                            const src = this.state.src

                            let w = this.refs.width.value
                            let h = this.refs.height.value
                            let name = this.refs.name.value

                            if(name) {
                                
                                this.props.methodName(name, src, w, h, ()=>{
                                    alert('Uploaded succesfully')
                                    this.setState({
                                        src:'',
                                        error:'',
                                        isOpen: false
                                    })
                                })
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
                        <SimContainer {...this.state}/>
                        <div>{this.submitButton()}</div>
                    </form>
                    <button onClick = {()=>this.setState({isOpen:false, src:''})}>Cancel</button>   
                </Modal>
            </div>
        )
    }
}