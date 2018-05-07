import React from 'react';
import Dropzone from 'react-dropzone';
import SimsList from './SimsList';
import {Sims} from '../api/sims'

export default class Upload extends React.Component {
    constructor() {
      super()
      this.state = {
        accepted: [],
        rejected: []
      }
    }
  
    render() {
      return (
        <div>
        <section>
          <div className="dropzone">
            <Dropzone
              accept="application/javascript"
              onDrop={(accepted, rejected) => {

                   this.setState({ accepted, rejected }); 

                   accepted.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const code = reader.result;
                            Sims.insert({code});
                        };
                        reader.onabort = () => console.log('file reading was aborted');
                        reader.onerror = () => console.log('file reading has failed');
            
                        reader.readAsBinaryString(file);
                    });

                }}
            >
              <p>Try dropping some files here, or click to select files to upload.</p>
              <p>Only *.js will be accepted</p>
            </Dropzone>
          </div>
          <aside>
            <h2>Accepted files</h2>
            <ul>
              {
                this.state.accepted.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
              }
            </ul>
            <h2>Rejected files</h2>
            <ul>
              {
                this.state.rejected.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
              }
            </ul>
          </aside>
        </section>
        <SimsList/>
        </div>
      );
    }
  }