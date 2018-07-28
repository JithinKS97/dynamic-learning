import React from 'react'
import { Menu, Button } from 'semantic-ui-react'

export default class HorizontalList extends React.Component {

    constructor(props) {

        super(props)
    }


    renderList() {
        

        return this.props.slides.map((slide, index)=>{

            return (
                <Menu.Item
                
                    key = {index}
                    style = {{height:'100%', display:'flex', flexDirection:'column', justifyContent:'center'}}
                >   
                   

                        
                        <Button onClick = {()=>{

                            this.props.saveChanges(undefined, index)
                            
                        }} >{index + 1}</Button>
                        {this.props.userId == Meteor.userId()?<Button onClick = {()=>{

                            this.props.deleteSlide(index)
                        }} style = {{marginTop:'2.4rem'}}>X</Button>:null}
               
                </Menu.Item>
            )
        })
    }

    render() {

        return (

            <Menu>
                {this.renderList()}
            </Menu>
        )
    }    
}