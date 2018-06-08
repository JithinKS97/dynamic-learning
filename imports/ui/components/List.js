import React from 'react'
import { Meteor } from 'meteor/meteor'

const List = (props) => {

    const isOwner = Meteor.userId() == props.userId

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
                    <div className = 'slides-list__container' key = {index}>

                        <button className = 'slides-list__button' onClick = {()=>{props.saveChanges(undefined, index)}}>{props.showTitle?slide.title:index}</button>  

                        {isOwner?<button className = 'slides-list__delete' onClick = {()=>{

                            const confirmation = confirm('Are you sure you want to delete?')
                            
                            if(confirmation == true)
                                props.delete(index)

                        }}>X</button>:null}

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

