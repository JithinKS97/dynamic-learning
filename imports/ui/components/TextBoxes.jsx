/* eslint-disable */
import React from 'react'

import TextBox from './TextBox'

export default class TextBoxes extends React.Component {

  constructor(props) {

    super(props)
  }


  renderTextBoxes = () => {

    const slides = this.props.slides
    const curSlide = this.props.curSlide

    if (!slides[curSlide])
      return

    if (!slides[curSlide].textboxes)
      return

    return slides[curSlide].textboxes.map((textbox, index) => {

      return (
        <div key={index}>
          <TextBox
            isPreview={this.props.isPreview}
            saveChanges={this.props.saveChanges}
            deleteTextBox={this.props.delete}
            index={index}
            value={textbox.value}
            slides={this.props.slides}
            curSlide={this.props.curSlide}
            setCopiedState={this.props.setCopiedState}
          />
        </div>
      )
    })
  }

  render() {

    if (this.props.slides.length === 0)
      return null

    if (!this.props.slides[this.props.curSlide].textboxes)
      return null

    if (this.props.slides[this.props.curSlide].textboxes.length === 0)
      return null

    return (
      <div>{this.renderTextBoxes()}</div>
    )
  }
}


