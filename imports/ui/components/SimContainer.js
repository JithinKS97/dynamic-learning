import React from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'


export default class SimContainer extends React.Component{

    constructor(props){

        super(props)

        this.state = {
            loading:true
        }

    }

    componentDidMount() {

        const iframeLoaded = () => {

            /* For the communication to the iframe document, we create a MessageChannel,
                port 1 is the port in this window. On recieveing a message here, we call
                handleMessage.
            */

            this.setState({
                loading:false
            })

            this.channel = null;
            this.channel = new MessageChannel()
            this.channel.port1.onmessage = this.handleMessage.bind(this)
            const data = {}
            data.operation = 'sendingPort'
            this.otherWindow.postMessage(data, '*', [this.channel.port2])

        }

        this.otherWindow = this.iframe.contentWindow

        this.iframe.addEventListener("load", iframeLoaded, false);

    }

    handleMessage(e) {

        /* If the iframe is just a preview, we need not have the message operations.
           If the operation propety of the object is save, the data is fetched and saved
           to the data property of the simulation.
           If the opration property is load, the data stored is send back.
        */

        let {slides, curSlide, index} = this.props

        if(e.data.operation == 'save') {
            console.log('data to be saved:',e.data.data)
            slides[curSlide].iframes[index].data = e.data.data
            this.props.saveChanges(slides, undefined)
        }
        else if(e.data.operation == 'load') {

            this.otherWindow.postMessage({operation:'load', data:slides[curSlide].iframes[index].data}, '*')
        }
        else if(e.data.operation == 'dom') {
            console.log(e.data.data)
        }
        else if(e.data.operation == 'keyPress') {
            if(e.data.Key == 'a')
                this.props.undo()
            else if(e.data.Key == 'x')
                this.props.next()
            else if(e.data.Key == 'z')
                this.props.previous()
            else if(e.data.Key == 's')
                this.props.save()
            else if(e.data.Key == 'd')
                this.props.interact()
        }

    }

    render(){

        return(

            <div className = 'sim'>
                <Dimmer active = {this.state.loading}>
                    <Loader/>
                </Dimmer>
                {
                    this.props.src?
                        <div>

                            <iframe
                                className = 'iframe'
                                ref = {e => this.iframe = e}
                                scrolling = 'no'
                                height = {this.props.h}
                                width = {this.props.w} 
                                src={this.props.src}>
                            </iframe>

                        </div>
                        :null
                }

            </div>
        )
    }
}
