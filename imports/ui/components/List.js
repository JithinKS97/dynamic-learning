import React from 'react'

const List = (props) => {

    const renderSlides = () => {        

        /* This component is intended for rendering slides list*/
        
        const slides = props.slides

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
                        <button onClick = {()=>{props.saveChanges(undefined, index)}}>{props.showTitle?slide.title:index}</button>    
                        <button onClick = {()=>{props.delete(index)}}>X</button>
                    </div>
                )
            })
        }        
    }


    return (
        <div>
            {renderSlides()}
        </div>
    )
}

export default List

