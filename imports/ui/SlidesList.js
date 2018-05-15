import React from 'react'


export default class SlidesList extends React.Component {

    constructor(props) {
        super(props)
        this.renderSlides.bind(this)
    }

    renderSlides() {        
        
        const slides = this.props.slides

        const that = this.props.that

        if(slides.length!=0) {

            return slides.map((slide, index)=>{

                return (
                    
                    <div key = {index}>

                        <button onClick = {()=>{this.props.saveChanges(undefined, index)}}>{index}</button>
    
                        <button onClick = {()=>{
    
                            if(slides.length!=1) {
                                slides.splice(index, 1)
    
                                let currSlide = index-1
    
                                if(index == 0) {
                                    currSlide = 0
                                }
    
                                this.props.saveChanges(slides, currSlide)
                            }
                            else {
                                this.props.reset()
                            }
                            
                        }}>X</button>

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

