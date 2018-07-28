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
                    style = {{height:'100%'}}
                >   
                    <div style = {{display:'flex', flexDirection:'column', justifyContent:'space-around'}}>

                        
                        <Button onClick = {()=>{

                            this.props.saveChanges(undefined, index)
                            
                        }} style = {{height:'100%'}}>{index + 1}</Button>
                        {this.props.userId == Meteor.userId()?<Button onClick = {()=>{

                            this.props.deleteSlide(index)
                        }} style = {{marginTop:'2.4rem'}}>X</Button>:null}
                        
                    </div>
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