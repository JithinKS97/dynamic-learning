import React from 'react'
import { Button, Modal, Form, Container } from 'semantic-ui-react'


export default class VideoContainer extends React.Component {

    constructor(props) {

        super(props)
        this.state = {
            open:false,
            url:'error'
        }
    }

    getId(url) {

        console.log(url)

        if(!url)
            return
        
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
    
        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return 'error';
        }
    }

    urlHandle() {
        
        const url = this.url.value.match('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$')
        if(url) {
            const validUrl = url[0]
            if(validUrl) {
                this.setState({
                    url: this.url.value
                })
            }
        }
        else {
            this.setState({
                url:'error'
            })
        }   
    }

    render() {

        return(
            <div>
                <Modal size = 'small' open = {this.state.open}>
                    <Modal.Header>
                        Add video
                        <Button className = 'close-button' onClick = {()=>{
                        this.setState({
                            open:false,
                            url:'error'
                        })
                    }}>X</Button>
                    </Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Form>
                                <Form.Field>
                                    <label>Youtube url</label>
                                    <input onChange = {this.urlHandle.bind(this)} ref = {e => this.url = e}/>
                                </Form.Field>
                                {this.state.url =='error'?null:
                                    <div>
                                        <iframe 
                                            width="560" 
                                            height="315" 
                                            src={`//www.youtube.com/embed/${this.getId(this.state.url)}?rel=0&amp;showinfo=0`} 
                                            frameBorder="0" 
                                            allowFullScreen>
                                        </iframe>
                                        <Form.Field>
                                            <Button onClick = {()=>{

                                                this.props.addVideo(this.state.url)
                                                this.setState({
                                                    open:false,
                                                    url:'error'
                                                })
                                            }}>Submit</Button>
                                        </Form.Field>
                                    </div>
                                }
                            </Form>
                        </Modal.Description>
                    </Modal.Content>
                    
                </Modal>
                {
                    this.props.url?
                    <Container>
                        <Button style = {{marginBottom:'0.8rem'}} onClick = {()=>{
                            
                            this.props.addVideo(null)
                            
                        }}>X</Button>
                        <iframe 
                            width="920" 
                            height="600" 
                            src={`//www.youtube.com/embed/${this.getId(this.props.url)}?rel=0&amp;showinfo=0`} 
                            frameBorder="0" 
                            allowFullScreen>
                        </iframe>
                        <br/>

                    </Container>                   
                    
                    :

                    <Button onClick = {()=>{
                        this.setState({
                            open:true
                        })
                    }}>Add video link</Button>

                }
            </div>
        )
    }
}