/*eslint-disable*/
import React from 'react';
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react/prefer-stateless-function
export default class About extends React.Component {
  render() {
    return (
      <div style={{ padding: '1.6rem' }}>
        <Link to="/">
          <Button>Back</Button>
        </Link>
        <h1 style={{ marginTop: '0.8rem' }}> About Dynamic Learning </h1>
        <h3 style={{ marginTop: '0rem' }}> What is Dynamic Learning? </h3>
        <div style={{ width: '60%' }}>
            In the modern day and age where technology is such a prominent and important tool, STEM
            education has a lack of interactive and visual learning for interested students.
            Dynamic Learning is an application that allows teachers and creative coders to collaborate
            in creating interactive simulations to improve the classroom experience using p5.js. It has
            support for workbooks and lessons which can be assigned to specific classes which are created
            by teachers. Requests can be made to create new simulations, which can then be viewed by
            coders on the requests page. There will soon be support for assessments which can be given by
            teachers to students in their class.
        </div>
        <br />
        <h4 style={{ marginTop: '0rem' }}> Workbooks </h4>
        <div style={{ width: '60%' }}>
            Workbooks is a system in which slides can be created with embedded simulations made
            with p5.js. There is an interactive canvas which can be drawn on. The canvas can also include
            textboxes and descriptions of other content which it contains. From the workbook area, teachers
            can also create requests for simulations which developers can then take on.
        </div>
        <br />
        <h4 style={{ marginTop: '0rem' }}> Lessons </h4>
        <div style={{ width: '60%' }}>
            In a similar fashion to workbooks, lessons are a set of slides that can be used by teachers
            in the classroom. Lessons, as opposed to workbooks, use the idea of pairing videos with
            simulations. The lefthand side contains a YouTube video and the right side contains a
            simulation related to the topic of the slide.
        </div>
        <br />
        <h4 style={{ marginTop: '0rem' }}> Classes </h4>
        <div style={{ width: '60%' }}>
            Classes can be created by teachers and a unique class code will be created along with the
            class. Teachers can give these codes to students and they can add the classes to their own
            account. From the classes page, students can view workbooks associated with the class.
            Teachers can add workbooks to classes from the settings of a specific workbook.
        </div>
        <br />
        <h1 style={{ marginTop: '0rem' }}> For Developers </h1>
        <h4 style={{ marginTop: '0rem' }}> How to make simulations </h4>
        <div style={{ width: '60%' }}>
            If you are interested in making simulations, feel free to create an account and look at
            some of the existing requests for simulations! In order to create simulations that work
            with Dynamic Learning, it is important that they are developed in the
            <a href="https://editor.p5js.org/"> p5 web editor. </a>
            Please make sure to keep in mind that all simulations should be developed
            using a canvas of size &nbsp;
            <span style={{ backgroundColor: 'lightgray', fontFamily: 'monospace' }}>
                (windowWidth, windowHeight)
            </span>.
        </div>
      </div>
    );
  }
}
