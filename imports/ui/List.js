import React from 'react'


export default class List extends React.Component {

    constructor(props) {
        super(props)
        this.renderSlides.bind(this)
    }

    renderSlides() {        
        
        const slides = this.props.slides

        if(slides.length!=0) {

            return slides.map((slide, index)=>{

                return (                    
                    <div key = {index}>
                        <button onClick = {()=>{this.props.saveChanges(undefined, index)}}>{index}</button>    
                        <button onClick = {()=>{this.props.delete(slides, index)}}>X</button>
                    </div>
                )
            })
        }        
    }

    render() {
        return (
            <div>
                {this.renderSlides()}
            </div>
        )
    }
}

