import React from 'react'
import ReactDOM from 'react-dom'


export default class SimContainer extends React.Component{

    constructor(props){

        super(props) 
        this.iframe = React.createRef()
        this.channel = new MessageChannel();  
        this.load.bind(this)
        this.save.bind(this)
        this.channel.port1.onmessage = this.handleData.bind(this);
    }

    componentDidMount() {

        this.iframe.current.addEventListener("load", this.iframeLoaded.bind(this), false)
        if(this.props.getSave)
            this.props.getSave(this.save.bind(this))


    }

    iframeLoaded() {
        
        this.otherWindow = this.iframe.current.contentWindow
        this.otherWindow.postMessage('sendingPort', '*', [this.channel.port2]);
    }

    load() {

        const {slides, curSlide, index} = this.props        
        this.otherWindow.postMessage({operation:'load', data:slides[curSlide].iframes[index].data}, '*');
    }

    save() {

        this.otherWindow.postMessage({operation:'save'}, '*');
    }

    handleData(e) {

        const {slides, curSlide, index} = this.props        
        slides[curSlide].iframes[index].data = e.data
        console.log(slides[curSlide].iframes[index].data)

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
            {this.props.preview?<button onClick = {this.load.bind(this)}>Load</button>:null}
            </div>
        )
    }
}



