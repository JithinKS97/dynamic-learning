import React from 'react';
import { Link } from 'react-router-dom';
export default class LoadScreen extends React.Component {
    renderVideo(){
      if(window.innerWidth>700)
        return <video src="/video.mp4" autoPlay="true" loop="true" muted></video>;
    }
    render() {
        return(
          <header className="v-header container">
            <div className="fullscreen-video-wrap">
              {this.renderVideo()}
            </div>
            <div className="header-overlay"></div>
            <div className="header-content text-md-center">
              <h1>Dynamic Learning</h1>
              <p>A platform where teachers and creative programmers can collaborate to create STEM lessons taught with the help of interactive simulations and animations.</p>
              <Link className="btn" to="/explore">Explore</Link>
              <Link style = {{marginLeft:'2.4rem'}}className="btn" to="/login">Login</Link>
            </div>
          </header>
        );
    }
}
