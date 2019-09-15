import React, { Component } from 'react';
import { FaCode } from 'react-icons/fa';
import { Meteor } from 'meteor/meteor';
import {
  Button,
  Grid,
  Modal,
  Tab,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import PropTypes from 'prop-types';
import SimsDirectories from './directories/SimsDirectories';
import SimPreview from './SimPreview';
import SharedSims from './sharingList/SharedSims';
import { generateSrc } from '../../functions';
/*
    This component is for the addition of simulations to the workbook.
*/

export default class AddSim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      node: null,
    };
    this.handleOpen.bind(this);
    this.handleClose.bind(this);
  }

  componentDidMount() {
    Meteor.subscribe('sims.public');
  }

  getNode = (node) => {
    this.setState({ node });
  }

  addSim = () => {
    this.setState({ isOpen: true });
  }

  handleOpen = () => {
    this.setState({ isOpen: true });
  }

  handleClose = () => {
    this.setState({ isOpen: false });
  }

  addToLesson = () => {
    const { node } = this.state;
    if (node) {
      const {
        slides,
        curSlide,
      } = this.props;
      const allSlides = Object.values($.extend(true, {}, slides));
      const {
        username,
        project_id,
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
      };
      allSlides[curSlide].iframes.push(sim);
      const { updateSlides } = this.props;
      updateSlides(allSlides, 'ownerOp');
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
        render: () => <Tab.Pane style={{ height: '429px', overflow: 'auto' }}><SharedSims getNode={this.getNode} /></Tab.Pane>,
      },
      {
        menuItem: 'My simulations',
        render: () => (
          <Tab.Pane>
            <SimsDirectories height={400} getNode={this.getNode} isPreview />
          </Tab.Pane>
        ),
      },
    ];
    const {
      isOpen,
      node,
    } = this.state;

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
                    ref={(e) => { this.tab = e; }}
                    onTabChange={() => {
                      this.setState({ node: null });
                    }}
                    panes={panes}
                  />
                </Grid.Column>
                {node
                  ? (
                    <Grid.Column style={{ overflow: 'auto', marginTop: '43px' }}>
                      <SimPreview
                        src={generateSrc(node.username, node.project_id)}
                      />
                    </Grid.Column>
                  ) : <h2 style={{ margin: 'auto' }}>Select a simulation</h2>
                }
                {node
                  ? (
                    <Button
                      style={{ marginLeft: '0.8rem', visibility: node ? 'visible' : 'hidden' }}
                      onClick={this.addToLesson}
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
                      href={node ? `https://editor.p5js.org/${node.username}/sketches/${node.project_id}` : ''}
                    >
                      <Button><FaCode /></Button>
                    </a>
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

AddSim.propTypes = {
  curSlide: PropTypes.number,
  slides: PropTypes.arrayOf(PropTypes.object),
  updateSlides: PropTypes.func.isRequired,
};

AddSim.defaultProps = {
  curSlide: 0,
  slides: [{ iframes: [] }],
};
