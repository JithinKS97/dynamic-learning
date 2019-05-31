/* eslint-disable */
import React from 'react'
import Rnd from 'react-rnd'
import { Dimmer, Loader } from 'semantic-ui-react'

export default class SimPreview extends React.Component {

    constructor(props) {

        super(props)

        this.state = {

            h:360,
            w:640,
            loading:true
        }
    }

    componentDidMount() {

        this.setState({

            h:this.props.h,
            w:this.props.w
        })
    }

    iframeLoaded = () => {

        this.setState({
            loading:false
        })
        
    }

    getHeight() {

        
        if(!this.props.slides) {
            return 360
        }
        else if(this.props.h) {
            this.setState({
                h:this.props.h
            })
        }
    }

    getWidth() {

        if(!this.props.slides) {
            return 640
        }
        else if(this.props.w) {
            this.setState({
                w:this.props.w
            })
        }

    }

    render() {
        

        return (
 
            
                <Rnd
                    resizeHandleStyles = {{
                        width:'100px',
                        height:'100px'
                    }}

                    style = {{position:'relative', marginBottom:'1.6rem'}}

                    disableDragging = { true }

                    enableResizing = {{
                                            
                        bottom: false,
                        bottomLeft: false,
                        bottomRight: true,
                        left: false,
                        right: false,
                        top: false,
                        topLeft: false,
                        topRight: false
                    }}
                    

                    onResize={(e, direction, ref, delta, position) => {      

                        this.setState({
                            
                            h: ref.offsetHeight,
                            w: ref.offsetWidth
                        },()=>{

                            if(!this.props.slides)
                                return

                            this.props.slides[this.props.curSlide].iframes[this.props.index].w = ref.offsetWidth
                            this.props.slides[this.props.curSlide].iframes[this.props.index].h = ref.offsetHeight                            
                        })
                    }}
                
                >
                    <Dimmer active = {this.state.loading}>
                        <Loader/>
                    </Dimmer>
                    
                    <iframe 
                        style = {{border: this.props.src?'2px solid grey':'none'}}
                        className = 'iframe'
                        scrolling = 'no'
                        onLoad = {this.iframeLoaded.bind(this)}
                        ref = {e => this.iframe = e} 
                        width = {(this.state.w|| 640)+'px'} 
                        height = {(this.state.h|| 360)+'px'}
                        src={this.props.src}>
                    </iframe>
                </Rnd>

        )
    }
   
}

/**
 * Props
 * 
 * h,w,slides,src,userId,slides,index
 */