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
                    style = {{height:'100%', display:'flex', flexDirection:'column', justifyContent:this.props.userId == Meteor.userId()?'space-between':'center'}}
                >   
                   

                        
                        <Button onClick = {()=>{

                            this.props.saveChanges(undefined, index)
                            
                        }} >{index + 1}</Button>
                        {this.props.userId == Meteor.userId()?<Button onClick = {()=>{

                            this.props.deleteSlide(index)
                        }} >X</Button>:null}
               
                </Menu.Item>
            )
        })
    }

    render() {

        return (

            <Menu  style = {{height:'100%'}}>
                {this.renderList()}
            </Menu>
        )
    }    
}