import React from 'react'


export default class SlidesList extends React.Component {

    constructor(props) {
        super(props)
        this.renderSlides.bind(this)
    }

    renderSlides() {        
        
        const slidesArray = this.props.slides

        const that = this.props.that

        if(slidesArray.length!=0) {

            return slidesArray.map((slide, index)=>{

                return (
                    
                    <div key = {index}>

                        <button onClick = {()=>{
                            that.setState({
                                currSlide: index
                            }, () => {
                                that.refs.d.b.setImg(that.state.slides[that.state.currSlide].note)
                            })    
                        }}>{index}</button>
    
                        <button onClick = {()=>{
    
                            if(slidesArray.length!=1) {
                                slidesArray.splice(index, 1)
    
                                let destination = index-1
    
                                if(index == 0) {
                                    destination = 0
                                }
    
                                that.setState({
                                    slides: slidesArray,
                                    currSlide: destination
                                },()=>{
                                    that.refs.d.b.setImg(that.state.slides[that.state.currSlide].note)
                                })
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

