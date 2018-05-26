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
        if(this.props.iframeLoaded == true)
            this.iframe.addEventListener('load', this.iframeLoaded.bind(this), false)        
    }

    iframeLoaded() {

        this.otherWindow = this.iframe.contentWindow
        this.otherWindow.postMessage({operation:'sendingPort'}, '*', [this.channel.port2])
    }

    handleMessage(e) {

        let {slides, curSlide, index} = this.props

        if(e.data.operation == 'save') {
            console.log('data to be saved:',e.data.data)
            slides[curSlide].iframes[index].data = e.data.data
            this.props.saveChanges(slides, undefined)
        }
        else if(e.data.operation == 'load')
        {
            this.otherWindow.postMessage({operation:'load', data:slides[curSlide].iframes[index].data}, '*')
        }
    }



    render(){
        
        return(

            <div className = 'sim'>
                
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



