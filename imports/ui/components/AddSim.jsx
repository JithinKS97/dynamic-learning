/*
  eslint-disable
  react/jsx-no-bind,
  no-return-assign,
  no-unused-vars,
  block-scoped-var
*/
import React, { Component } from 'react';
import FaCode from 'react-icons/lib/fa/code';
import { Meteor } from 'meteor/meteor';
import {
  Button,
  Grid,
  Modal,
  Tab,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import SimsDirectories from './SimsDirectories';
import SimPreview from './SimPreview';
import SharedSims from './SharedSims';
import { generateSrc } from '../../functions';

/*
    This component is for the addition of simulations to the lessonplan.
*/

export default class AddSim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      node: null,
      username: '', // eslint-disable-line react/no-unused-state
    };
    this.handleOpen.bind(this);
    this.handleClose.bind(this);
  }

  componentDidMount() {
    Meteor.subscribe('sims.public');
  }

  getNode(node) {
    this.setState({ node }, () => {
      const { userId } = this.state.node; // eslint-disable-line react/destructuring-assignment
      Meteor.call('getUsername', userId, (err, username) => {
        this.setState({ username }); // eslint-disable-line react/no-unused-state
      });
    });
  }

  addSim() {
    this.setState({ isOpen: true });
  }

  handleOpen() {
    this.setState({ isOpen: true });
  }

  handleClose() {
    this.setState({ isOpen: false });
  }

  addToLesson() {
    const { node } = this.state;
    if (node) {
      const {
        slides, // eslint-disable-line react/prop-types
        curSlide, // eslint-disable-line react/prop-types
      } = this.props;
      const allSlides = Object.values($.extend(true, {}, slides));
      const {
        username,
        project_id, // eslint-disable-line camelcase
        w,
        h,
      } = node;
      const sim = {
        username,
        project_id,
        w,
        h,
        x: 50,
        y: 50,
        data: {},
        pane: null,
      };

      allSlides[curSlide].iframes.push(sim);
      // eslint-disable-next-line react/prop-types, react/destructuring-assignment
      this.props.saveChanges(allSlides);
      this.setState({
        isOpen: false,
        node: null,
      });
    }
  }

  render() {
    const panes = [
      {
        menuItem: 'Shared simulations',
        render: () => <Tab.Pane style={{ height: '429px', overflow: 'auto' }}><SharedSims getNode={this.getNode.bind(this)} /></Tab.Pane>,
      },
      {
        menuItem: 'My simulations',
        render: () => (
          <Tab.Pane>
            {/* eslint-disable-next-line react/jsx-boolean-value */}
            <SimsDirectories height={400} getNode={this.getNode.bind(this)} isPreview={true} />
          </Tab.Pane>
        ),
      },
    ];
    const {
      isOpen,
      activeIndex,
      node,
    } = this.state;
    // FIXME: this is pobably a bad idea
    if (node) {
      var { // eslint-disable-line no-var, vars-on-top
        username,
        project_id, // eslint-disable-line camelcase
        linkToCode,
      } = node;
    }

    return (
      <div>
        <Modal
          open={isOpen}
          onClose={this.handleClose}
          size="fullscreen"
        >
          <Modal.Header>
            Simulations
            <Button
              className="close-button"
              onClick={() => {
                this.setState({ node: this.handleClose() });
              }}
            >
              &times;
            </Button>
          </Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Grid
                style={{ paddingBottom: '1.6rem' }}
                columns={2}
                divided
              >
                <Grid.Column width={8}>
                  <Tab
                    ref={e => this.tab = e}
                    onTabChange={(event, data) => {
                      this.setState({ node: null });
                    }}
                    panes={panes}
                  />
                </Grid.Column>
                {node
                  ? (
                    <Grid.Column style={{ overflow: 'auto', marginTop: '43px' }}>
                      <SimPreview
                        src={generateSrc(username, project_id)}
                      />
                    </Grid.Column>
                  ) : <h2 style={{ margin: 'auto' }}>Select a simulation</h2>
                }
                {node
                  ? (
                    <Button
                      style={{ marginLeft: '0.8rem', visibility: node ? 'visible' : 'hidden' }}
                      onClick={this.addToLesson.bind(this)}
                    >
                      Add to lesson
                    </Button>
                  ) : null
                }
                {node
                  ? (
                    <a
                      className="link-to-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={node ? linkToCode : ''}
                    >
                      <Button><FaCode /></Button>
                    </a>
                  ) : null
                }
                {!!node && activeIndex === 0
                  ? (
                    <p style={{ paddingTop: '0.8rem' }}>
                      {`Author: ${username}`}
                    </p>
                  ) : null
                }
              </Grid>
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}
