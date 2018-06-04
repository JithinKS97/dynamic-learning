import React from 'react'
import '../../api/castify-api'

export default class SandBox extends React.Component {

  constructor(props) {

    super(props)

    this.record.bind(this)
    this.state = {
      isConnected:null,
      id:null
    }

    screencastify.setAppId(6394026632151040)
    
    
  }

  componentDidMount() {

    that = this
    
    screencastify.isAppConnected().then(function(isConnected) {
      that.setState({
        isConnected
      })
    });

  }
  
  componentDidUpdate() {
    screencastify.isAppConnected().then(function(isConnected) {
      that.setState({
        isConnected
      })
    });
  }

  record() {
    
    const that = this

    const recorder = new screencastify.Recorder();
    recorder.start({
      recordConfig: {  // optional
        captureSource: 'desktop',  // for window picker, use 'screen' for screen picker
        audio: {
          mic: true,
          system: false
        }
      },
      shareUrl: 'http://localhost:3000',  // URL of your page that handles shared files.
      payload: 'optional arbitrary string'  // Can be retrieved in share handler.
    }).then(function() {

      screencastify.onSharedFiles = function(fileIds) {

        that.setState({
          id:fileIds[0]
        })

        return true
  
      }
      
    });

  }

  getFile() {

    if(this.state.id) {

      screencastify.getFile(this.state.id).then(function(fileInfo) {

        const file = fileInfo.file
        console.log(file)

      });

    }
  }

  connect() {
    screencastify.connectApp();
    console.log(screencastify)
  }

  render() {
    return (
      <div>
        <h2>{this.state.isConnected?'connected':'not connected'}</h2>
        <button onClick = {this.connect.bind(this)}>Connect</button>
        <button onClick = {this.record.bind(this)}>Record</button>
        <button onClick = {this.getFile.bind(this)}>Get file</button>
      </div>
    )
  }

}