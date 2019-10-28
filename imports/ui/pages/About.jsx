import React from "react";
import { Link } from 'react-router-dom';

export default () => {
  const Programmer = () => (
    <div className="about__programmer-container">
      <img className="about__programmer" src="/programmer.png"></img>
    </div>
  );

  const Teacher = () => (
    <div className="about__teacher-container">
      <img className="about__teacher" src="/teacher.png"></img>
    </div>
  );

  const LogoAndTitle = () => (
    <div className="about__logo-and-title-container">
      <img
        className="about__logo-and-title"
        src="/logo-and-title-black.png"
      ></img>
      <div className="about__title-description">
        <p>
          A platform where teachers and creative coders collaborate to create
          STEM lessons taught with the help of interactive simulations and
          animations
        </p>
      </div>
    </div>
  );
  
  const Header = () => {
    return (
      <div className='loadscren__header-container'>
         <Link to='/'>
          <div style={{color:'black'}} className = 'about__header-button '>
            X
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Header/>
      <div className="about__main">
        <Programmer />
        <Teacher />
        <LogoAndTitle />
        <Description />
      </div>
    </div>
  );
};

const Description = () => (
  <div className="about__description">
    <h1 style={{ marginTop: "0.8rem" }}> About Dynamic Learning </h1>
    <h3 style={{ marginTop: "0rem" }}> What is Dynamic Learning? </h3>
    <div className='about__description-paragraphs'>
      In the modern day and age where technology is such a prominent and
      important tool, STEM education has a lack of interactive and visual
      learning for interested students. Dynamic Learning is an application that
      allows teachers and creative coders to collaborate in creating interactive
      simulations to improve the classroom experience using p5.js. It has
      support for workbooks and lessons which can be assigned to specific
      classes which are created by teachers. Requests can be made to create new
      simulations, which can then be viewed by coders on the requests page.
      There will soon be support for assessments which can be given by teachers
      to students in their class.
    </div>
    <br />
    <h3 style={{ marginTop: "0rem" }}> Workbooks </h3>
    <div className='about__description-paragraphs'>
      Workbooks is a system in which slides can be created with embedded
      simulations made with p5.js. There is an interactive canvas which can be
      drawn on. The canvas can also include textboxes and descriptions of other
      content which it contains. From the workbook area, teachers can also
      create requests for simulations which developers can then take on.
    </div>
    <br />
    <h3 style={{ marginTop: "0rem" }}> Lessons </h3>
    <div className='about__description-paragraphs'>
      In a similar fashion to workbooks, lessons are a set of slides that can be
      used by teachers in the classroom. Lessons, as opposed to workbooks, use
      the idea of pairing videos with simulations. The lefthand side contains a
      YouTube video and the right side contains a simulations to the
      topic of the slide.
    </div>
    <br />
    <h3 style={{ marginTop: "0rem" }}> Classes </h3>
    <div className='about__description-paragraphs'>
      Classes can be created by teachers and a unique class code will be created
      along with the class. Teachers can give these codes to students and they
      can add the classes to their own account. From the classes page, students
      can view workbooks associated with the class. Teachers can add workbooks
      to classes from the settings of a specific workbook.
    </div>
    <br />
    <h2 style={{ marginTop: "0rem" }}> For Developers </h2>
    <h3 style={{ marginTop: "0rem" }}> How to make simulations </h3>
    <div className='about__description-paragraphs'>
      If you are interested in making simulations, feel free to create an
      account and look at some of the existing requests for simulations! In
      order to create simulations that work with Dynamic Learning, it is
      important that they are developed in the
      <a  target="_blank" href="https://editor.p5js.org/"> p5 web editor. </a>
    </div>
  </div>
);
