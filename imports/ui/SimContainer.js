import React from 'react'
import ReactDOM from 'react-dom'


export default class SimContainer extends React.Component{

    constructor(props){

        super(props) 
        this.iframe = React.createRef()
        this.channel = new MessageChannel();  
        this.post.bind(this)
        this.channel.port1.onmessage = this.handleMessage.bind(this);
    }

    componentDidMount() {   

        this.otherWindow = this.iframe.current.contentWindow        
        this.iframe.current.addEventListener("load", this.iframeLoaded.bind(this), false)
              
    }

    iframeLoaded() {
        this.otherWindow.postMessage('sendingPort', '*', [this.channel.port2]);
    }

    post() {      
        this.otherWindow.postMessage('Hello from the webapp!', '*');
    }

    handleMessage(e) {
        console.log(e.data)
    }

    render(){
        
        return(
            <div>
            <div className = 'sim'>
                
                {
                    this.props.src?
                        <iframe 
                            ref = {this.iframe} 
                            scrolling = 'no' 
                            height = {this.props.h+'px'} 
                            width = {this.props.w+'px'} 
                            src={this.props.src}>
                        </iframe>:null
                }

            </div>
            <button onClick = {this.post.bind(this)}>Post</button>
            </div>
        )
    }
}



