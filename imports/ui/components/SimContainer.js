import React from 'react'
import ReactDOM from 'react-dom'
import Link from 'react-router-dom'


export default class SimContainer extends React.Component{

    constructor(props){

        super(props) 

        /* For the communication to the iframe document, we create a MessageChannel,
           port 1 is the port in this window. On recieveing a message here, we call
           handleMessage.
        */

        this.channel = new MessageChannel()
        this.channel.port1.onmessage = this.handleMessage.bind(this)
    }

    componentDidMount() {
        
        /* If the iframe is loaded, we send the port to the other window, i.e the 
           window of the iframe.
        */

        if(this.props.src)
            this.iframe.addEventListener('load', this.iframeLoaded.bind(this), false)        
    }


    iframeLoaded() {
        
        /* The 2nd port is send to the iframe window which we use for sending message
           to this window.
        */
        this.otherWindow = this.iframe.contentWindow
        this.otherWindow.postMessage({operation:'sendingPort'}, '*', [this.channel.port2])
    }

    handleMessage(e) {

        /* If the iframe is just a preview, we need not have the message operations.
           If the operation propety of the object is save, the data is fetched and saved
           to the data property of the simulation.
           If the opration property is load, the data stored is send back.
        */

        if(!this.props.isPreview)
        {
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
            else if(e.data.operation == 'dom') {
                console.log(e.data.data)
            }
        }
    }



    render(){

        return(

            <div className = 'sim'>
                                
                {
                    this.props.src?
                        <div>

                            <iframe 
                                ref = {e => this.iframe = e} 
                                scrolling = 'no' 
                                height = {this.props.h+'px'} 
                                width = {this.props.w+'px'} 
                                src={this.props.src}>
                            </iframe>
                            
                        </div>                        
                        :null
                }

            </div>
        )
    }
}



