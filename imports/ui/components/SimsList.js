import React from 'react'
import SimPreview from './SimPreview'
import SimContainer from './SimContainer'
import Rnd from 'react-rnd'
import { Meteor } from 'meteor/meteor'
import 'semantic-ui-css/semantic.min.css';
import TiArrowMove from 'react-icons/lib/ti/arrow-move'
import FaClose from 'react-icons/lib/fa/close'
import FaCode from 'react-icons/lib/fa/code'
import MdNetworkCell from 'react-icons/lib/md/network-cell'
import { Button } from 'semantic-ui-react'



export default class SimsList extends React.Component {

    constructor(props) {

        super(props)
        this.renderSims.bind(this)
    }

    
    renderSims() {

        function calcMargin(iframes, index) {

            if(iframes.length == 1) {

                return 0
            }
            else if(iframes.length-1!=index) {
                return '13rem'
            }
            else {
                return '6rem'
            }
        }



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
                                resizeHandleClasses = '.sim-resize'
                                size={{ width: this.props.navVisibility?iframe.w+40:iframe.w,  height: iframe.h}}
                                position={{ x: iframe.x, y: iframe.y }}

                                onDragStart={()=>{

                                    const sims = $('.sim')

                                    for(let i=0;i<sims.length;i++) {
                                        
                                        sims[i].style['pointer-events'] = 'none'
                                    }
                                }}
    
                                onDragStop={(e, d) => {

                                    const sims = $('.sim')

                                    for(let i=0;i<sims.length;i++) {
                                        
                                        sims[i].style['pointer-events'] = 'unset'
                                    }
    
                                    slides[curSlide].iframes[index].x = d.lastX
                                    slides[curSlide].iframes[index].y = d.lastY
    
                                    this.props.saveChanges(slides)
                                    
                                }}

                                enableResizing = {{
                                    
                                    bottom: false,
                                    bottomLeft: false,
                                    bottomRight: this.props.isPreview?false:true,
                                    left: false,
                                    right: false,
                                    top: false,
                                    topLeft: false,
                                    topRight: false
                                }}
                                

                                onResize={(e, direction, ref, delta, position) => {
                                  
                                    slides[curSlide].iframes[index].w = this.props.navVisibility?ref.offsetWidth-40:ref.offsetWidth
                                    slides[curSlide].iframes[index].h = ref.offsetHeight
                                    this.props.saveChanges(slides)
                                }}
    
                            > 
                                {/*The index is passed so that we can pass and retrieve
                                    data of this iframe. iframe is passed to set the
                                    height and with of the iframe.
                                */}
                                <div style ={{display:'flex', flexDirection:'row'}}>

                                    <SimContainer
                                        {...this.props} 
                                        index = {index} 
                                        src = {iframe.src}
                                        {...iframe}
                                    />
                                    <div>
                                        <a style = {{marginLeft:'0.5rem', display:this.props.navVisibility?'none':'block'}} className = 'link-to-code' target = '_blank' href = {iframe.linkToCode}><FaCode size = '22' /></a>
                                    </div>
                                    <div className = 'sim-nav' style = {{ marginLeft:'0.5rem', visibility:this.props.navVisibility?'visible':'hidden'}}>

                                        <div style = {{display:'flex', flexDirection:'column'}}>
                                            
                                            <FaClose
                                                className = 'sim-delete'
                                                onClick = {()=>{
                                                
                                                    const confirmation = confirm('Are you sure you want to remove this?')
            
                                                    if(confirmation == true)
                                                        this.props.delete(index)}
                                                }
                                                size  = '20'                              
                                            />
                                        
                                            <TiArrowMove size = '22' className = 'sim-handle'/>

                                            <a className = 'link-to-code' target = '_blank' href = {iframe.linkToCode}><FaCode size = '22' /></a>
                                        </div>

                                        <div style = {{float:'right', marginLeft:'0.6rem', marginBottom:'0.1rem'}}><MdNetworkCell/></div>   

                                    </div>                    

                                </div>
                            </Rnd>
                        </div>
                    )
                }
                else {

  
                    return (              
                 
                            <div style = {{marginBottom:calcMargin(iframes, index)}} key = {index}>

                                <Button                                 
                                    
                                    style = {{
                                        visibility:this.props.userId == Meteor.userId()?'visible':'hidden',
                                        marginTop:'0.8rem', 
                                        marginBottom:'0.8rem', 
                                        float:'center'
                                    }}
                                    onClick = {()=>{

                                        const confirmation = confirm('Are you sure you want to remove this?')
                                        if(confirmation == true)
                                            this.props.delete(index)
                                    }}>X

                                </Button>              
                                                               
                                <div>
                                    <SimPreview
                                        isPreview = {false}
                                        {...this.props} 
                                        index = {index} 
                                        src = {iframe.src}
                                        {...iframe}
                                        w = {iframe.w}
                                        h = {iframe.h}
                                    />
                                </div>
                                <div>
                                    <a style = {{marginLeft:'0.5rem', display:this.props.navVisibility?'none':'block'}} className = 'link-to-code-lesson' target = '_blank' href = {iframe.linkToCode}><FaCode size = '22' /></a>
                                </div>
                                
                                    
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