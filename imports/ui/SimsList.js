import React from 'react'
import SimContainer from './SimContainer'
import Rnd from 'react-rnd'
import {Tracker} from 'meteor/tracker'
export default class SimsList extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            width:640,
            height:360
        }               
    }

    componentDidMount() {
        
    }

    componentDidUpdate() {
        
    }

    renderSims() {


        /* This component displays a list of simulations.
           The props contatin the current slides and the slides.

           The iframes of the current slide are onbained and rendered.

           On clicking the X button the delete function passed in the props is called.
        */

        const { slides, curSlide } = this.props

        if(slides.length!=0) {

            const { iframes } = slides[curSlide]
            return iframes.map((iframe,index)=>{

                return (
                    <div key = {index} className = 'sim'>

                        <Rnd size={{ width: iframe.w,  height: iframe.h }}
                            position={{ x: iframe.x, y: iframe.y }}
                            onDragStop={(e, d) => {

                                slides[curSlide].iframes[index].x = d.lastX
                                slides[curSlide].iframes[index].y = d.lastY

                                this.props.saveChanges(slides, undefined)
                            }}
                            
                            onResize={(e, direction, ref, delta, position) => {

                                this.setState({
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                                ...position,
                                });
                                
                                slides[curSlide].iframes[index].w = ref.offsetWidth
                                slides[curSlide].iframes[index].h = ref.offsetHeight
                                
                            }}

                            disableDragging = {this.props.rnd?false:true}

                            enableResizing = {this.props.rnd?{bottomRight:true}:false}

                        >                                           
                            <SimContainer
                                preview = {true}
                                {...this.props} 
                                index = {index} 
                                {...iframe} 
                                src = {iframe.src}
                                saveAndLoad = {true}
                            />
                            
                            <button onClick = {()=>{this.props.delete(slides, iframes, index)}}>X</button>                        
                        
                        </Rnd>
                    </div>
                )
            })
        }
    }

    render() {
        
        return (
            <div>
                {this.renderSims()}
            </div>
        )
    }
}
