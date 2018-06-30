import React from 'react'
import { Meteor } from 'meteor/meteor'
import { Menu, Button} from 'semantic-ui-react'

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
                    <Menu.Item
                         style = {{display:'flex', justifyContent:'space-between'}}                
                         key = {index}                        
                    >
                        <Button style = {{width:'100%', textAlign:'left'}} onClick = {()=>{props.saveChanges(undefined, index)}}>{props.showTitle?slide.title:index}</Button>

                        {isOwner && !props.isPreview?<Button onClick = {()=>{

                            const confirmation = confirm('Are you sure you want to delete?')
                            
                            if(confirmation == true)
                                props.delete(index)

                        }}>X</Button>:null}

                    </Menu.Item>
                )
            })
        }        
    }


    return (
        <Menu style = {{display:'flex'}} icon vertical>
            {renderSlides()}
        </Menu>
    )
}

export default List

