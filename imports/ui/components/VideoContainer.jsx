import React from 'react';
import {
  Button, Modal, Form, Container, Dimmer, Loader,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

export default class VideoContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      _url: 'error',
      loading: true,
    };
  }

  getId = (url) => {
    if (!url) { return; }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    }
    return 'error';
  }

  urlHandle() {
    const url = this.url.value.match('^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$');
    if (url) {
      const validUrl = url[0];
      if (validUrl) {
        this.setState({
          _url: this.url.value,
        });
      }
    } else {
      this.setState({
        _url: 'error',
      });
    }
  }

  youtubeLink() {
    const { userId } = this.props;
    if (userId === Meteor.userId()) {
      return (
        <Button
          style={{

          }}
          onClick={() => {
            this.setState({
              open: true,
            });
          }}
        >
          Add youtube link
        </Button>

      );
    }
    return null;
  }

  deleteButton() {
    const { userId, addVideo } = this.props;
    if (userId === Meteor.userId()) {
      return (
        <Button
          style={{ marginBottom: '0.8rem' }}
          onClick={() => {
            const confirmation = confirm('Are you sure want to remove this video?');
            if (!confirmation) { return; }
            addVideo(null);
          }}
        >
          X
        </Button>
      );
    }
    return null;
  }

  render() {
    const { open, _url, loading } = this.state;
    const { addVideo, url } = this.props;
    return (
      <div>
        <Modal size="small" open={open}>
          <Modal.Header>
            Add video
            <Button
              className="close-button"
              onClick={() => {
                this.setState({
                  open: false,
                  _url: 'error',
                });
              }}
            >
              X
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Form>
                <Form.Field>
                  <label>Youtube url</label>
                  <input onChange={this.urlHandle.bind(this)} ref={(e) => { this.url = e; }} />
                </Form.Field>
                {_url === 'error' ? null
                  : (
                    <div>

                      <iframe
                        width="560"
                        height="315"
                        src={`//www.youtube.com/embed/${this.getId(_url)}?rel=0&amp;showinfo=0`}
                        frameBorder="0"
                        allowFullScreen
                      />
                      <Form.Field>
                        <Button onClick={() => {
                          addVideo(_url);
                          this.setState({
                            open: false,
                            _url: 'error',
                          });
                        }}
                        >
                          Submit
                        </Button>
                      </Form.Field>
                    </div>
                  )
                }
              </Form>
            </Modal.Description>
          </Modal.Content>

        </Modal>

        {
          url
            ? (
              <Container>
                {this.deleteButton()}
                <br />
                <Dimmer active={loading}>
                  <Loader />
                </Dimmer>
                <iframe
                  onLoad={() => {
                    this.setState({
                      loading: false,
                    });
                  }}
                  width="720"
                  height="480"
                  src={`//www.youtube.com/embed/${this.getId(url)}?rel=0&amp;showinfo=0`}
                  frameBorder="0"
                  allowFullScreen
                />
                <br />

              </Container>
            )
            : this.youtubeLink()
        }
      </div>
    );
  }
}

VideoContainer.propTypes = {
  addVideo: PropTypes.func,
  url: PropTypes.string,
  userId: PropTypes.string,
};

VideoContainer.defaultProps = {
  addVideo: () => null,
  url: '',
  userId: '',
};
