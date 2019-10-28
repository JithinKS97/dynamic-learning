import React from "react";
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
      <div className="about__description">
        <p>
          A platform where teachers and creative coders collaborate to create STEM lessons taught
          with the help of interactive simulations and animations</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="about__main">
        <Programmer />
        <Teacher />
        <LogoAndTitle />
      </div>
    </div>
  );
};
