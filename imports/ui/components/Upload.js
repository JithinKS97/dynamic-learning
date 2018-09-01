import React from 'react'
import { Meteor } from 'meteor/meteor'
import SimPreview from './SimPreview'


import { Button, Modal, Form} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
 

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
            modalOpen: false,
            linkToCode:''
        }
    }

    componentDidMount() {
        Meteor.subscribe('sims')
    }
    
    onEnter(e) {
        
        e.preventDefault()
        let entry = this.src.value
        let linkToCode = this.linkToCode.value
        this.setState({
            error:entry
        })


        /* The link.match checks if the iframe entered is valid by using regular
           expression. The src should be set only if the entered tag is valid.
        */

        const tag = entry.match(`<iframe.+?src="https://editor.p5js.org/embed/[ A-Za-z0-9_@./#&+-]*"></iframe>`)
        const link = linkToCode.match(`https://editor.p5js.org/[ A-Za-z0-9_@./#&+-]*/sketches/[ A-Za-z0-9_@./#&+-]*`)


        
        if(tag && link) {
            const validTag = tag[0]
            const validLink = link[0]
            
            /* The contents in the src is obtained using regular expression */

            const src = validTag.match(`src\s*=\s*"\s*(.*)\s*">`)

            const srcEnding = validTag.match(`embed/(.*)"></iframe>`)
            const linkEnding = validLink.match(`sketches/(.*)`)


            if(src && srcEnding[1] === linkEnding[1]) {

                const validSrc = src[1]
                this.setState({
                    src: validSrc,
                    linkToCode: validLink
                })
            }
            else {
                
                this.setState({
                    src:'',
                    linkToCode:''
                })
            }
        }
        else {
            this.setState({
                src:'',
                linkToCode:''
            })
        }
    }

    onSubmit(e) {

        e.preventDefault()

        const {src, linkToCode} = this.state
        const w = '640px'
        const h = '360px'
        const name = this.name.value

        if(src && name ) {           

            let uploaded = false;

            if(typeof this.props.methodToRun == 'string') {
                   
                Meteor.call(this.props.methodToRun, name, src, w, h, linkToCode)
                uploaded = true                             
            }
            else if(typeof this.props.methodToRun == 'function') {

                this.props.methodToRun(name, src, w, h, linkToCode)
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
                    h:null,
                    linkToCode
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
                   <Modal.Header>
                       Add simulation
                       <Button className = 'close-button' onClick = {this.handleClose}>
                            X
                        </Button>
                    </Modal.Header>

                   <Modal.Content>

                            <Form>
                                <Form.Field>
                                    <label>iframe tag from p5 online text editor</label>
                                    <input ref = { e => this.src = e} onChange = {this.onEnter.bind(this)} placeholder='Iframe tag' />
                                </Form.Field>
                                <Form.Field>
                                    <label>Code edit link</label>
                                    <input ref = { e => this.linkToCode = e} onChange = {this.onEnter.bind(this)} placeholder='Iframe tag' />
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