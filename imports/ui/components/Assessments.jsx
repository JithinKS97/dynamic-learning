/* eslint-disable react/jsx-indent */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import MathQuill, { addStyles as addMathquillStyles } from 'react-mathquill';

addMathquillStyles();

export default class Assessments extends React.Component {

  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    return (
        <div style={{ textAlign: 'left' }}>
          Please enter your question here:
              <div
                style={{
                  marginTop: '3px',
                  color: 'black',
                  width: '60%',
                  borderWidth: '1px',
                  borderColor: 'black',
                  borderStyle: 'solid',
                  padding: '3px',
                }}
                contentEditable
                ref={e => this.content = e}
              >
                {this.content !== undefined && this.content.value}
              </div>
        </div>
    );
  }
}
