import React from "react";
import { Link } from "react-router-dom";

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
      <div className="loadscren__header-container">
        <Link to="/">
          <div className="about__header-button">X</div>
        </Link>
      </div>
    );
  };

  return (
    <div>
      <Header />
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
    <p className="about__description-paragraphs">
      Dynamic learning is an{" "}
      <a target="blank" href="https://github.com/JithinKS97/dynamic-learning">
        open source online platform
      </a>{" "}
      where STEM teachers can collaborate with creative coders to create, share
      and present lessons that make use of interactive visualizations created
      using web technologies like{" "}
      <a target="blank" href="https://p5js.org/">
        p5.js.
      </a>
    </p>
    <h3 style={{ marginTop: "0rem" }}>
      What dynamc learning aims to accomplish?{" "}
    </h3>
    <p className="about__description-paragraphs">
      Science and Math has helped us a lot in understanding of the Universe in
      which we live. But when it comes to getting answers to very deep questions
      like why does it exist in the first place, we are are nowhere near. A
      famous author once said "We are atleast 5 Einsteins away from
      understanding why does the Universe exist in the first place". Dynamic learning hopes to
      contribute towards accelerating this understanding by improving Science
      and Math education. Its goal is to create a huge collection of interactive
      STEM visualizations and lessons that anybody will have access to, to
      improve their understanding of the Science and Math concepts.
    </p>
    <h3 style={{ marginTop: "0rem" }}> Why interactive visualizations? </h3>
    <p className="about__description-paragraphs">
      Human visual processing system is highly sophisticated and has been
      evolved to be extremely good at interpreting and extracting information.
      This is the reason why information presented through visuals can be
      understood way better than that conveyed using written or spoken words
      alone. Images short circuit brain to understand information better. But we
      can do even better. When compared to images or videos, interactive
      visualizations and simulations have way more explanatory power because it
      allows the users to directly interact with the system in whichever way
      they want to observe how it behaves in different situations.
    </p>
    <p>
      But interactive visualizations are difficult to create. Only through a
      collective effort, we can produce a good collection of them. As more and
      more teachers and creative coders come and collaborate through Dynamic
      learning, an ever increasing collection of interactive visualizations that
      anybody can customize and use according to their needs will be created.
    </p>
    <h3 style={{ marginTop: "0rem" }}>p5.js and p5.js web editor</h3>
    <p className="about__description-paragraphs">
      <a target="blank" href="https://p5js.org/">
        p5.js
      </a>{" "}
      is a Javascript library that helps to create interactive visualizations
      very easily and quickly. The{" "}
      <a target="blank" href="https://editor.p5js.org/">
        online text editor
      </a>{" "}
      for p5 enables you to very quickly spin up a p5 project and develop the
      simulations fully online. You are not limited to p5.js alone. You are free
      to use any other Javascript libraries which will serve the purpose.The
      simulations created in the editor can then be imported to Dynamic learning
      to create lessons.
    </p>
  </div>
);
