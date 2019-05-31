/* eslint-disable */
import React from 'react'
import '../../api/castify-api'
import { Meteor } from 'meteor/meteor'

export default class SandBox extends React.Component {

  constructor(props) {

    super(props)

    this.record.bind(this)
    this.state = {
      isConnected: null,
      id: null,
      src: ''
    }

    screencastify.setAppId(6394026632151040)
    this.getFile.bind(this)
  
  }

  componentDidMount() {

    Meteor.subscribe('videos')

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

    const that = this

    if(this.state.id) {

      screencastify.getFile(that.state.id).then(function(fileInfo) {

        const file = fileInfo.file

        const ms = new MediaSource()
        ms.addEventListener('webkitsourceopen', onSourceOpen.bind(ms), false)

        const video = document.querySelector('video')

      })

    }
  }


  connect() {
    screencastify.connectApp();
    console.log(screencastify)
  }

  fire() {

    
    console.log(video)

  }

  render() {
    return (
      <div>
        <h2>{this.state.isConnected?'connected':'not connected'}</h2>
        <button onClick = {this.connect.bind(this)}>Connect</button>
        <button onClick = {this.record.bind(this)}>Record</button>
        <button onClick = {this.getFile.bind(this)}>Get file</button>
        <button onClick = {this.fire.bind(this)}>Fire</button>

        <br/>

        <video controls autoPlay></video>

      </div>
    )
  }

}
