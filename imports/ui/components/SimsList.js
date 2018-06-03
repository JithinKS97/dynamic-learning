import React from 'react'
import SimContainer from './SimContainer'
import Rnd from 'react-rnd'
import {Tracker} from 'meteor/tracker'
import {withTracker} from 'meteor/react-meteor-data'
import {Link} from 'react-router-dom'
import { Meteor } from 'meteor/meteor'

const SimsList = (props) => {

    const renderSims = () => {


        /* This component displays a list of simulations.
           The props contain the current slide no. and the slides.

           The iframes of the current slide are obtained and rendered.

           On clicking the X button the delete function passed in the props is called.
        */  
        const {slides, curSlide} = props
        

        if(slides.length!=0) {

            iframes = slides[curSlide].iframes

            return iframes.map((iframe,index)=>{

                /*Rnd is the react component which is used for dragging and resizing 
                    of the iframes. For more information about it, look in the documentation
                    of React-Rnd. 

                    The size and the positions are initialized. The size with the values entered
                    when the simulations are uploaded, and the position values are 0 by default initially.

                    onDragStop is called everytime the iframe is stopped dragging, we set its position
                    to the current position it had when it has been finished dragging. The changes are saved.

                    onResize is called everytime the iframe is resized. The dimensions of the iframes
                    are set accordingly.

                    IsRnd is the prop that is passed to decide whether we need the resize
                    and drag feature enabled.

                    isPreview is a variable which specifies whether the iframe is just a preview 
                    or is it the real simulation used in the lessonplan. 
                */
                if(props.isRndRequired) {
                    
                    return (
                        <div key = {index} className = 'sim-floating'>               
    
                            <Rnd 
                                
                                size={{ width: iframe.w,  height: iframe.h}}
                                position={{ x: iframe.x, y: iframe.y }}
    
                                onDragStop={(e, d) => {
    
                                    slides[curSlide].iframes[index].x = d.lastX
                                    slides[curSlide].iframes[index].y = d.lastY
    
                                    props.saveChanges(slides, undefined)
                                }}
                                
                                onResize={(e, direction, ref, delta, position) => {
                                    
                                    slides[curSlide].iframes[index].w = ref.offsetWidth
                                    slides[curSlide].iframes[index].h = ref.offsetHeight
                                    
                                    props.saveChanges(slides, undefined)
                                }}
    
                            > 
                                {/*The index is passed so that we can pass and retrieve
                                    data of this iframe. iframe is passed to set the
                                    height and with of the iframe.
                                */}
    
                                <SimContainer
                                    isPreview = {false}
                                    {...props} 
                                    index = {index} 
                                    src = {iframe.src}
                                    {...iframe}
                                />
                                <button onClick = {()=>{props.delete(index)}}>X</button>                                                    
                                
                            </Rnd>
                        </div>
                    )
                }
                else {
                    console.log()
                    return (
                        <div key = {index}>
                            <SimContainer
                                        isPreview = {false}
                                        {...props} 
                                        index = {index} 
                                        src = {iframe.src}
                                        {...iframe}
                                    />
                            {iframe.userId == Meteor.userId()?<button onClick = {()=>{props.delete(index)}}>X</button>:null}  
                        </div>
                    )
                }
                
            })
        }         
    }
        
    return (
        <div>
            {renderSims()}
        </div>
    )

}

export default SimsList