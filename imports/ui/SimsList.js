import React from 'react'
import SimContainer from './SimContainer'

export default class SimsList extends React.Component {

    constructor(props) {
        super(props)
    }

    renderSims() {

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