import React from 'react';
import { Accounts } from 'meteor/accounts-base';
import {
  Tab,
  Button,
  Modal,
  Checkbox,
  Label,
  Header,
} from 'semantic-ui-react';
import { Tracker } from 'meteor/tracker';
import { FaCode } from 'react-icons/fa';
import TagsInput from 'react-tagsinput';
import WorkbooksDirectories from '../components/directories/WorkbooksDirectories';
import RequestsList from '../components/sharingList/RequestsList';
import SimsDirectories from '../components/directories/SimsDirectories';
import SharedLessons from '../components/sharingList/SharedLessons';
import LessonsDirectories from '../components/directories/LessonsDirectories';
import SideBar from '../components/SideBar';
import SimPreview from '../components/SimPreview';
import { Sims } from '../../api/sims';
import SharedWorkbooks from '../components/sharingList/SharedWorkbooks';
import 'semantic-ui-css/semantic.min.css';
import { generateSrc } from '../../functions/index.js';
import Profile from '../components/Profile/Profile';
import Classes from '../components/classes/Classes';
import Assessments from '../components/assessments/Assessments';
import HeaderWithLogo from '../components/HeaderWithLogo';

/*
    This is the Component which renders the dashboard of the application.
 */

export default class Dashboard extends React.Component {
  /*
    node holds the value of the currently selected sim, modelOpen
    is used to set the open status of the model
    which displays the sim, isPublic holds the value in the checkbox
    which decides whether the simuation is
    shared with the other users, editable is turned active when
    the title is editable.

    Title holds the title of the selected simulation and tags holds
    the search tags of the selected simulation.
  */

  constructor(props) {
    super(props);

    this.state = {
      node: null,
      isPublic: null,
      editable: false,
      title: '',
      tags: [],
    };

    this.renderOption.bind(this);
  }

  componentDidMount() {
    this.simsTracker = Tracker.autorun(() => {
    /* This code is for ensuring that when title gets updated,
        then new data is fetched from the database
        and set to state so that the new title value is rendered after its update.
    */

      const { node } = this.state;
      if (node) {
        const sim = Sims.findOne({ _id: node._id });
        this.setState({
          node: sim,
        });
      }
    });
  }

  componentWillUnmount() {
    this.simsTracker.stop();
  }

  getNode = (node) => {
  /* This function is executed in the SimsDirectories component
      (See the component, this function is passed as a prop to it)
      whenever a sim node is selected, the selected node is set accepted as
      the argument and set to state.
      The latest title, sharing option and the tags data are
      fetched from the database and set to the state.
  */

    this.setState(
      {
        node,
      },
      () => {
        const sim = Sims.findOne({ _id: node._id });
        this.setState({
          node: sim,
          isPublic: sim.isPublic,
          title: node.title,
          tags: node.tags,
        });
      },
    );
  }

  renderOption = () => {
    /*  Panes is an array which holds the content to display under each tab.
        The first one is the Workbook directories and the second one is shared workbooks list.
    */

    const panes = [
      {
        menuItem: 'My workbooks',
        render: () => (
          <Tab.Pane style={{ height: '70vh', backgroundColor: '#f8f8f8' }}>
            {' '}
            <WorkbooksDirectories />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Shared workbooks',
        render: () => (
          <Tab.Pane style={{ height: '70vh', backgroundColor: '#f8f8f8' }}>
            <SharedWorkbooks height="70vh" />
          </Tab.Pane>
        ),
      },
    ];

    // eslint-disable-next-line react/prop-types
    const { match: { params: { option } } } = this.props;

    /* The components are rendered depending upon the selection in the menu */

    switch (option) {
      case 'workbooks':
        return (
          <div>
            <HeaderWithLogo title="Work Books" />
            <Tab panes={panes} />
          </div>
        );

      case 'requests':
        return (
          <div>
            <HeaderWithLogo title="Discussion forums" />
            <div style={{ backgroundColor: '#f8f8f8', height: '75vh' }}>
              <RequestsList />
            </div>
          </div>
        );

      case 'uploadsim':
        return (
          <div>
            <HeaderWithLogo title="Manage Simulations" />
            <SimsDirectories
              height="75vh"
              getNode={this.getNode}
              isPreview={false}
            />
          </div>
        );
      case 'lessons':
        return (
          <div>
            <HeaderWithLogo title="Manage Lessons" />
            <LessonsDirectories />
          </div>
        );
      case 'watchlesson':
        return (
          <div>
            <HeaderWithLogo title="Watch Lessons" />
            <div style={{ height: '75vh', backgroundColor: '#f8f8f8', padding: '2rem' }}>
              <SharedLessons />
            </div>
          </div>
        );
      case 'profile':
        return (
          <div>
            <HeaderWithLogo title="Profile" />
            <Profile />
          </div>
        );
      case 'classes':
        return (
          <div>
            <HeaderWithLogo title="Classes" />
            <Classes />
          </div>
        );
      case 'assessments':
        return (
          <div>
            <Header> Assessments </Header>
            <Assessments />
          </div>
        );
      default:
    }
  }

  handleClose = () => this.setState({ node: null, editable: false });

  editTitle = () => {
    const { editable, node, title } = this.state;
    if (editable === false) {
      this.setState({ editable: true });
    } else {
      if (this.title.value === '') {
        this.setState({ editable: false });
        return;
      }

      Meteor.call('sims.titleChange', node._id, title);
      this.setState({ editable: false });
    }
  }

  handleTagsInput(tags) {
    const { node } = this.state;
    this.setState({ tags }, () => {
      Meteor.call('sims.tagsChange', node._id, tags);
    });
  }

  render() {
    const {
      node,
      editable,
      title,
      isPublic,
      tags,
    } = this.state;
    return (
      <div style={{ height: '100vh' }}>
        <Modal
          closeOnRootNodeClick={false}
          style={{ width: 'auto' }}
          open={!!node}
          onClose={this.handleClose}
          size="small"
        >
          <Modal.Header>
            Preview
            <Button className="close-button" onClick={this.handleClose}>
              X
            </Button>
          </Modal.Header>

          <Modal.Content>
            <Modal.Description>
              <SimPreview
                src={
                  node
                    ? generateSrc(
                      node.username,
                      node.project_id,
                    )
                    : ''
                }
              />
              <br />
              {editable ? null : (
                <Label
                  style={{
                    padding: '0.8rem',
                    width: '18rem',
                    textAlign: 'center',
                  }}
                >
                  <h4>{node ? title : null}</h4>
                </Label>
              )}
              {editable ? (
                <input
                  ref={(e) => { this.title = e; }}
                  onChange={() => {
                    this.setState({ title: this.title.value });
                  }}
                  style={{ padding: '0.8rem', width: '18rem' }}
                />
              ) : null}
              <Button
                onClick={this.editTitle}
                style={{ marginLeft: '0.8rem' }}
              >
                {editable ? 'Submit' : 'Edit title'}
              </Button>
              <a
                style={{ marginLeft: '0.8rem' }}
                className="link-to-code"
                target="_blank"
                href={node ? node.linkToCode : ''}
              >
                <Button>
                  <FaCode />
                </Button>
              </a>
            </Modal.Description>
            <Modal.Description>
              <Checkbox
                style={{ margin: '0.8rem 0' }}
                checked={isPublic}
                ref={(e) => { this.checkbox = e; }}
                onChange={() => {
                  Meteor.call(
                    'sims.visibilityChange',
                    node._id,
                    !this.checkbox.state.checked,
                  );
                  this.setState({
                    isPublic: !this.checkbox.state.checked,
                  });
                }}
                label="Share with others"
              />
              {isPublic ? (
                <TagsInput
                  value={tags}
                  onChange={this.handleTagsInput}
                />
              ) : null}
            </Modal.Description>
          </Modal.Content>
        </Modal>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100vw' }}>
          <div style={{ width: '20vw', padding: '2rem' }}>
            <Button
              style={{ marginBottom: '0.8rem' }}
              onClick={() => {
                Accounts.logout();
              }}
            >
              Log out
            </Button>
            <SideBar />
          </div>
          <div style={{ width: '80vw' }}>
            <div style={{ width: '85%', margin: 'auto' }}>
              {this.renderOption()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
