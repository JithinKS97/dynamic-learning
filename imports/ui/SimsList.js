import React from 'react'
import SimContainer from './SimContainer'

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

        const slides = this.props.slides
        const currSlide = this.props.currSlide

        if(slides.length!=0) {

            const iframes = slides[currSlide].iframes
            return iframes.map((iframe,index)=>{
                return (
                    <div key = {index}>
                        <SimContainer src = {iframe}/>
                        <button onClick = {()=>{this.props.delete(slides, iframes, index)}}>X</button>
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