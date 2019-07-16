/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import MultipleChoice from './MultipleChoice';

export default class MCQs extends React.Component {
  render() {
    const { slides, curSlide } = this.props;
    if (!slides[curSlide] || !slides[curSlide].questions) return (<div> </div>);
    return (
      <div>
        {
          slides[curSlide].questions.map((question, index) => (
            <div>
              <MultipleChoice
                index={index}
                content={question.content}
                {...this.props}
              />
            </div>
          ))
        }
      </div>
    );
  }
}
