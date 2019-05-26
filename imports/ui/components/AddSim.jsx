/*
  eslint-disable
  react/destructuring-assignment,
  react/jsx-no-bind,
  no-return-assign,
  no-unused-vars
*/
import React from 'react';
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

export default class AddSim extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      node: null,
      username: '',
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
        this.setState({ username });
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
      const { slides } = this.props; // eslint-disable-line react/prop-types
      const allSlides = Object.values($.extend(true, {}, slides));
      const { curSlide } = this.props; // eslint-disable-line react/prop-types
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
        render: () => <Tab.Pane style={{ height: '429px' }}><SharedSims getNode={this.getNode.bind(this)} /></Tab.Pane>,
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

    return (
      <div>
        <Modal
          open={this.state.isOpen}
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
                {this.state.node
                  ? (
                    <Grid.Column style={{ overflow: 'auto', marginTop: '43px' }}>
                      <SimPreview
                        src={generateSrc(this.state.node.username, this.state.node.project_id)}
                      />
                    </Grid.Column>
                  ) : <h2 style={{ margin: 'auto' }}>Select a simulation</h2>
                }
                {this.state.node
                  ? (
                    <Button
                      style={{ marginLeft: '0.8rem', visibility: this.state.node ? 'visible' : 'hidden' }}
                      onClick={this.addToLesson.bind(this)}
                    >
                      Add to lesson
                    </Button>
                  ) : null
                }
                {this.state.node
                  ? (
                    <a
                      className="link-to-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={this.state.node ? this.state.node.linkToCode : ''}
                    >
                      <Button><FaCode /></Button>
                    </a>
                  ) : null
                }
                {!!this.state.node && this.tab.state.activeIndex === 0
                  ? (
                    <p style={{ paddingTop: '0.8rem' }}>
                      {`Author: ${this.state.username}`}
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
