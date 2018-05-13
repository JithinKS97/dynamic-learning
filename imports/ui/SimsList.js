import React from 'react'

export default class SimsList extends React.Component {

    constructor(props) {
        super(props)
    }

    renderSims() {
        const slides = this.props.slides
        const currSlide = this.props.currSlide
        if(slides.length!=0) {

            /*
                I don't know why. But deletion won't work if you had named the array to which 
                you initially bring the iframes as iframes instead of iframeArray.
            */

            
            const iframeArray = slides[currSlide].iframes
            return iframeArray.map((iframe,index)=>{
                return (
                    <div key = {index}>
                        <iframe src = {iframe}></iframe>
                        <button onClick = {()=>{                            
                            iframeArray.splice(index,1)
                            slides[currSlide].iframes = iframeArray
                            this.props.that.setState({
                                slides
                            })  
                        }}>X</button>
                    </div>
                )
            })
        }
    }

    render() {
        return <div>{this.renderSims()}</div>
    }
}