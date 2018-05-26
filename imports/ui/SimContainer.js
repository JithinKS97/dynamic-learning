import React from 'react'
import ReactDOM from 'react-dom'


export default class SimContainer extends React.Component{

    constructor(props){

        super(props) 
        this.iframe = React.createRef()
        this.channel = new MessageChannel();
        this.channel.port1.onmessage = this.handleMessage.bind(this);
    }

    componentDidMount() {

        this.iframe.addEventListener('load', this.iframeLoaded.bind(this), false)
    }

    iframeLoaded() {

        this.otherWindow = this.iframe.contentWindow
        this.otherWindow.postMessage('sendingPort', '*', [this.channel.port2])
    }

    handleMessage(e) {

        console.log(e.data)
    }

    post() {
        
        this.otherWindow.postMessage('sendingMessage', '*')
    }

    render(){
        
        return(

            <div className = 'sim'>
                <button onClick = {this.post.bind(this)}>Post</button>
                
                {
                    this.props.src?
                        <iframe 
                            ref = {e => this.iframe = e} 
                            scrolling = 'no' 
                            height = {this.props.h+'px'} 
                            width = {this.props.w+'px'} 
                            src={this.props.src}>
                        </iframe>:null
                }

            </div>
        )
    }
}



