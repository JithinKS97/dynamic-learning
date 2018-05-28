import React from 'react'
import SimContainer from './SimContainer'
import Rnd from 'react-rnd'
import {Tracker} from 'meteor/tracker'

const SimsList = (props) => {

    const renderSims = () => {


        /* This component displays a list of simulations.
           The props contain the current slide no. and the slides.

           The iframes of the current slide are obtained and rendered.

           On clicking the X button the delete function passed in the props is called.
        */

        const { slides, curSlide } = props

        if(slides.length!=0) {

            const { iframes } = slides[curSlide]
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

                return (
                    <div key = {index} className = 'sim'>                    

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

                            disableDragging = {props.IsRndNeeded?false:true}
                            enableResizing = {props.IsRndNeeded?{bottomRight:true}:false}

                        >                                           
                            <SimContainer
                                isPreview = {false}
                                {...props} 
                                index = {index} 
                                {...iframe} 
                                src = {iframe.src}
                            />
                            
                            <button onClick = {()=>{props.delete(index)}}>X</button>                                                    
                        
                        </Rnd>
                    </div>
                )
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
