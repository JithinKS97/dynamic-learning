import React from 'react'


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
                                className = 'iframe'
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



