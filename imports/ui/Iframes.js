import React from 'react';
import p5 from 'p5';

export default class Iframes extends React.Component {

    componentDidMount() {

        function setup() {
            var cnv = createCanvas(100, 100);
            cnv.parent('sketch-holder');
            createCanvas(100, 100);
        }

        function draw() {
            background(255, 0, boop);
        }
    }

    render() {
        return(<div id="sketch-holder"></div>);
    }
}

