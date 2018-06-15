import React from 'react'
import SimContainer from './SimContainer'
import Rnd from 'react-rnd'
import { Meteor } from 'meteor/meteor'


import { Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import TiArrowMove from 'react-icons/lib/ti/arrow-move'
import FaTrash from 'react-icons/lib/fa/trash'


export default class simsList extends React.Component {

    constructor(props) {

        super(props)
        this.renderSims.bind(this)
      }


    renderSims() {


        /* This component displays a list of simulations.
           The props contain the current slide no. and the slides.

           The iframes of the current slide are obtained and rendered.

           On clicking the X button the delete function passed in the props is called.
        */  
        const {slides, curSlide} = this.props
        

        if(slides.length!=0) {

            const iframes = slides[curSlide].iframes
            
            
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


                if(this.props.isRndRequired) {                    

                    return (
                        
                        <div key = {index} className = 'sim-floating'>               
    
                            <Rnd 
                               
                                bounds = '.drawing-board-canvas'
                                dragHandleClassName = '.sim-handle'
                                size={{ width: iframe.w,  height: iframe.h}}
                                position={{ x: iframe.x, y: iframe.y }}
    
                                onDragStop={(e, d) => {
    
                                    slides[curSlide].iframes[index].x = d.lastX
                                    slides[curSlide].iframes[index].y = d.lastY
    
                                    this.props.saveChanges(slides, undefined)

                                    
                                }}

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
                                  
                                    slides[curSlide].iframes[index].w = ref.offsetWidth
                                    slides[curSlide].iframes[index].h = ref.offsetHeight
                                    this.props.saveChanges(slides, undefined)
                                }}
    
                            > 
                                {/*The index is passed so that we can pass and retrieve
                                    data of this iframe. iframe is passed to set the
                                    height and with of the iframe.
                                */}
                                <div style ={{display:'flex', flexDirection:'row'}}>
                                <SimContainer
                                    isPreview = {false}
                                    {...this.props} 
                                    index = {index} 
                                    src = {iframe.src}
                                    {...iframe}
                                />
                                <nav style = {{marginLeft:'0.5rem'}}>
                                    <FaTrash
                                        onClick = {()=>{
                                        
                                            const confirmation = confirm('Are you sure you want to remove this?')
    
                                            if(confirmation == true)
                                                this.props.delete(index)}
                                        }
                                        color = 'white'
                                        size  = '20'                              
                                    />
                                 
                                    <TiArrowMove className = 'icon__button' size = '22' className = 'sim-handle' color = 'white'/>

                                </nav>

                                </div>
                            </Rnd>
                        </div>
                    )
                }
                else {
            
                    return (
                   
                        <div key = {index}>
                            {iframe.userId == Meteor.userId()?
                            
                                    <button                                   
                                    
                                        style = {{float:'right'}}
                                        className = 'icon__button'                                        
                                        onClick = {()=>{

                                            const confirmation = confirm('Are you sure you want to remove this?')
                                            if(confirmation == true)
                                                this.props.delete(index)

                                        }}><FaTrash/>
                                    
                                    </button>:
                                
                                null}  
                                <SimContainer
                                    isPreview = {false}
                                    {...this.props} 
                                    index = {index} 
                                    src = {iframe.src}
                                    {...iframe}
                                />
                                
                        </div>
                    )
                }               
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
