/* eslint-disable */
import React from 'react'
import { Meteor } from 'meteor/meteor'
import SimPreview from './SimPreview'

import { Button, Modal, Form } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

import { generateSrc } from '../../functions/index.js';
import { isValidp5EmbedTag } from '../../functions/index.js';


export default class Upload extends React.Component {

  /*This component performs the function of uploading the iframe
    src stores the src of the input iframe tag, isOpen is for opening
    and closing of the modal.
  */

  constructor(props) {

    super(props)
    this.state = {
      src: '',
      error: '',
      modalOpen: false,
      linkToCode: '',

      username: '',
      project_id: ''
    }
  }

  componentDidMount() {
    Meteor.subscribe('sims')
  }

  onEnter(e) {

    e.preventDefault()

    const embedTag = this.src.value

    if (isValidp5EmbedTag(embedTag)) {

      this.setState({

        username: embedTag.match(`org/(.*)/embed`)[1],
        project_id: embedTag.match(`embed/(.*)"`)[1]
      })
    }
    else {

      this.setState({

        username: '',
        project_id: ''
      })
    }
  }

  onSubmit(e) {

    e.preventDefault()

    const { username, project_id } = this.state
    const w = '640px'
    const h = '360px'
    const name = this.name.value

    if (username && project_id && name) {

      let uploaded = false;

      if (typeof this.props.methodToRun == 'string') {

        Meteor.call(this.props.methodToRun, name, username, project_id, w, h)
        uploaded = true
      }
      else if (typeof this.props.methodToRun == 'function') {

        this.props.methodToRun(name, username, project_id)
        uploaded = true
      }
      if (uploaded == true) {

        alert('Uploaded succesfully')
        this.setState({
          project_id: '',
          error: '',
          modalOpen: false,
          name: null,
          w: null,
          h: null,
          username: ''
        })
      }
      this.handleClose()
    }
  }

  handleOpen = () => this.setState({ modalOpen: true })

  handleClose = () => this.setState({
    modalOpen: false,
    username: '',
    error: '',
    modalOpen: false,
    name: null,
    w: null,
    h: null,
    project_id: ''
  })

  render() {

    return (
      <Modal

        closeOnRootNodeClick={false}
        style={{ height: 'auto', width: 'auto', minWidth: '36rem' }}
        trigger={this.props.isPreview ? null : <Button style={{ display: Meteor.userId() ? 'inline' : 'none' }} onClick={this.handleOpen} >Add simulation</Button>}
        open={this.state.modalOpen}
        onClose={this.handleClose}
        size='tiny'

      >
        <Modal.Header>
          Add simulation
                       <Button className='close-button' onClick={this.handleClose}>
            X
                        </Button>
        </Modal.Header>

        <Modal.Content>

          <Form>
            <Form.Field>
              <label>iframe tag from p5 online text editor</label>
              <input ref={e => this.src = e} onChange={this.onEnter.bind(this)} placeholder='Iframe tag' />
            </Form.Field>
          </Form>

          {this.state.project_id && this.state.username ?
            <Form onSubmit={this.onSubmit.bind(this)} style={{ marginTop: '0.8rem' }}>
              <Form.Field>
                <label>Preview</label>
                <SimPreview
                  src={generateSrc(this.state.username, this.state.project_id)}
                />
              </Form.Field>

              <Form.Field>
                <label>Name</label>
                <input placeholder='Name' ref={e => this.name = e} />
              </Form.Field>

              <Form.Field>
                <Button>Submit</Button>
                <Button style={{ marginTop: '0.8rem' }} onClick={this.handleClose.bind(this)}>Close</Button>
              </Form.Field>
            </Form>
            : null
          }

        </Modal.Content>

      </Modal>
    )
  }
}