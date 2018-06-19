import React from 'react'
import { Meteor } from 'meteor/meteor'
import SimPreview from './SimPreview'


import { Button, Modal, Form, TextArea} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import Rnd from 'react-rnd'
 

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
            modalOpen: false
        }
    }

    componentDidMount() {
        Meteor.subscribe('sims')
    }
    
    onEnter(e) {
        
        e.preventDefault()
        let entry = this.src.value
        this.setState({
            error:entry
        })


        /* The link.match checks if the iframe entered is valid by using regular
           expression. The src should be set only if the entered tag is valid.
        */

        const tag = entry.match(`<iframe.+?src="https://alpha.editor.p5js.org/embed/[ A-Za-z0-9_@./#&+-]*"></iframe>`)
        
        if(tag) {
            const validTag = tag[0]

            /* The contents in the src is obtained using regular expression */

            const src = validTag.match(`src\s*=\s*"\s*(.*)\s*">`)
            if(src) {
                const validSrc = src[1]
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

    onSubmit(e) {

        e.preventDefault()

        const {src} = this.state
        const w = '300px'
        const h = '200px'
        const name = this.name.value

        console.log(this.state)


        if(src && name ) {           

            let uploaded = false;

            if(typeof this.props.methodToRun == 'string')
            {
                   
                Meteor.call(this.props.methodToRun, name, src, w, h)
                uploaded = true                             
            }
            else if(typeof this.props.methodToRun == 'function'){

                this.props.methodToRun(src, w, h)
                uploaded = true                
            }
            if(uploaded == true) {
                alert('Uploaded succesfully')
                this.setState({
                    src:'',
                    error:'',
                    modalOpen: false,
                    name:null,
                    w:null,
                    h:null
                }) 
            }
            this.handleClose()      
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
    handleClose = () => this.setState({ 
        modalOpen: false,
        src:'',
        error:'',
        modalOpen: false,
        name:null,
        w:null,
        h:null 
    })

    
    render() {

        return(                    
                <Modal
                            
                    closeOnRootNodeClick={false}
                    style = {{height:'auto', width:'auto', minWidth: '36rem'}}
                    trigger = {this.props.isPreview?null:<Button onClick={this.handleOpen} >Add simulation</Button>}
                    open={this.state.modalOpen}
                    onClose={this.handleClose}
                    size='tiny'

                >
                   <Modal.Header>Add simulation</Modal.Header>

                   <Modal.Content>

                            <Form>
                                <Form.Field>
                                    <label>Enter iframe tag from p5 online text editor ( Served through https )</label>
                                    <input ref = { e => this.src = e} onChange = {this.onEnter.bind(this)} placeholder='Iframe tag' />
                                </Form.Field>                            
                            </Form>

                                {this.state.src?
                                    <Form onSubmit = {this.onSubmit.bind(this)} style = {{marginTop:'0.8rem'}}>
                                        <Form.Field>
                                            <label>Preview</label>                                            
                                            <SimPreview {...this.state}/>                                           
                                        </Form.Field>
                                        
                                        <Form.Field>
                                            <label>Name</label>
                                            <input placeholder = 'Name' ref = {e => this.name = e}/>
                                        </Form.Field>
                                        
                                        <Form.Field> 
                                            <Button>Submit</Button> 
                                            <Button style = {{marginTop: '0.8rem'}} onClick = {this.handleClose.bind(this)}>Close</Button>                                        
                                        </Form.Field>                                        
                                    </Form>
                                    :null
                                }
                               

                                                                         

    
                    </Modal.Content>
                      
                </Modal>
        )
    }
}