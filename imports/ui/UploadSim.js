import React from 'react'
import { Sims } from  '../api/sims'

export default class UploadSim extends React.Component {

    constructor(props) {
        
        super(props)

        this.state = {
            src:'',
            error:''
        }
        this.renderSim.bind(this)
        this.submitButton.bind(this)
    }
    
    enteredLink(e) {

        e.preventDefault()
        let link = this.refs.sim.value
        this.setState({
            error:link
        })
        const tag = link.match(`(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))`)
        if(tag) {
            const validTag = tag[0]
            const src = validTag.match(`src\s*=\s*"\s*(.*)\s*">`)
            if(src) {
                validSrc = src[1]
                this.setState({
                    src:validSrc
                })
            }
            else {
                this.setState({
                    src:''
                })
            }
        }
        else {
            this.setState({
                src:''
            })
        }
    }

    renderSim() {
        if(this.state.src)
            return <iframe src={this.state.src}></iframe>

        else if(this.state.error!='')
            return <p>Invalid tag</p>
    }

    submitButton() {

        if(this.state.src) {
            return (
                <div>                    
                    <p>Name of the simulation</p>
                    <input ref = 'name'/>                

                    <button onClick = {(e)=>{

                        e.preventDefault()

                        let iframe = this.state.src
                        let name = this.refs.name.value


                        Sims.insert({
                            name,
                            iframe
                        },() => {
                            alert('Submitted successfully')

                            this.refs.sim.value = ''

                            this.setState({
                                src:'',
                                error:''
                            })
                        })

                    }}>Submit</button>
                </div>
            )
        }
        else return null
    }
    
    render() {
        return(
            <div>
                <form>
                    <h1>Submit simulation</h1>
                    <p>Enter the Iframe tag</p>
                    <input onChange={this.enteredLink.bind(this)} ref = 'sim'/>
                    <div>{this.renderSim()}</div>
                    <div>{this.submitButton()}</div>
                </form>
            </div>
        )
    }
}