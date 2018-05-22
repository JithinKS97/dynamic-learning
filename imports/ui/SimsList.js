import React from 'react'
import SimContainer from './SimContainer'
import Rnd from 'react-rnd'

export default class SimsList extends React.Component {

    constructor(props) {
        super(props)
    }

    renderSims() {

        /* This component displays a list of simulations.
           The props contatin the current slides and the slides.

           The iframes of the current slide are onbained and rendered.

           On clicking the X button the delete function passed in the props is called.
        */

        const { slides, currSlide } = this.props

        if(slides.length!=0) {

            const { iframes } = slides[currSlide]
            return iframes.map((iframe,index)=>{

                return (
                    <div key = {index} className = 'sim'>


                    <Rnd size={{ width: iframe.w,  height: iframe.h }}
                         position={{ x: iframe.x, y: iframe.y }}
                         onDragStop={(e, d) => {

                             slides[currSlide].iframes[index].x = d.lastX
                             slides[currSlide].iframes[index].y = d.lastY

                             this.props.saveChanges(slides, undefined)
                         }}
                         onResize={(e, direction, ref, delta, position) => {
                            this.setState({
                              width: ref.offsetWidth,
                              height: ref.offsetHeight,
                              ...position
                            });
                          }}
                    >


                        <SimContainer src = {iframe.src}/>
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
