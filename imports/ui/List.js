import React from 'react'


export default class List extends React.Component {

    constructor(props) {
        super(props)
        this.renderSlides.bind(this)
    }

    renderSlides() {        

        /* This component is intended for rendering slides list*/
        
        const slides = this.props.slides

        if(slides.length!=0) {

            return slides.map((slide, index)=>{

                /* There first button is intended for displaying the contents
                   withrespect to the current slide.

                   The second button is intended for the deletion of the slide.

                   Both these operations are not performed here. But the functions
                   that execute the operations are passed.
                */

                return (                    
                    <div key = {index}>
                        <button onClick = {()=>{this.props.saveChanges(undefined, index)}}>{this.props.showTitle?slide.title:index}</button>    
                        <button onClick = {()=>{this.props.delete(index)}}>X</button>
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

