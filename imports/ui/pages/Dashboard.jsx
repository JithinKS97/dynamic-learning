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
import HeaderWithLogo from '../components/dashboard/HeaderWithLogo';
import FolderFileOptions from '../components/dashboard/FolderFileOptions';
import history from '../../routes/history';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      node: null,
      isPublic: null,
      editable: false,
      title: '',
      tags: [],
      wbActiveIndex: 0,
    };
  }

  componentDidMount() {
    history.listen((location) => {
      if (location.pathname === '/dashboard/workbooks') {
        this.setState({
          wbActiveIndex: 0,
        });
      }
    });

    this.simsTracker = Tracker.autorun(() => {
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

  addWB = () => {
    this.wbDirRef.handleOpen();
  }

  addWBFolder = () => {
    this.wbDirRef.handle2Open();
  }

  addSim = () => {
    this.simsDirRef.openSimUploadModal();
  }

  addSimFolder = () => {
    this.simsDirRef.handleOpen();
  }

  addLesson = () => {
    this.lessonsDirRef.openModalToCreate('file');
  }

  addLessonFolder = () => {
    this.lessonsDirRef.openModalToCreate('folder');
  }

  renderCurrentlySelectedOption = () => {
    const panes = [
      {
        menuItem: 'My workbooks',
        render: () => (
          <Tab.Pane className="lighter-grey-background" style={{ height: '70vh' }}>
            <WorkbooksDirectories height="70vh" ref={(e) => { this.wbDirRef = e; }} />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Shared workbooks',
        render: () => (
          <Tab.Pane className="lighter-grey-background" style={{ height: '75vh', overflow: 'auto' }}>
            <SharedWorkbooks height="75vh" />
          </Tab.Pane>
        ),
      },
    ];

    // eslint-disable-next-line react/prop-types
    const { match: { params: { option } } } = this.props;
    const { wbActiveIndex } = this.state;

    switch (option) {
      case 'workbooks':
        return (
          <div>
            <HeaderWithLogo title="Work Books" />
            <Tab
              onTabChange={(e, d) => {
                this.setState({
                  wbActiveIndex: d.activeIndex,
                });
              }}
              ref={(e) => { this.tabRef = e; }}
              panes={panes}
            />
            {wbActiveIndex === 0 ? (
              <FolderFileOptions
                handleFolderAddPress={this.addWBFolder}
                handleFileAddPress={this.addWB}
              />
            ) : null}
          </div>
        );

      case 'requests':
        return (
          <div>
            <HeaderWithLogo title="Discussion forums" />
            <div className="lighter-grey-background" style={{ height: '80vh' }}>
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
              ref={(e) => { this.simsDirRef = e; }}
            />
            <FolderFileOptions
              handleFolderAddPress={this.addSimFolder}
              handleFileAddPress={this.addSim}
            />
          </div>
        );
      case 'lessons':
        return (
          <div>
            <HeaderWithLogo title="Manage Lessons" />
            <LessonsDirectories
              height="75vh"
              ref={(e) => { this.lessonsDirRef = e; }}
            />
            <FolderFileOptions
              handleFolderAddPress={this.addLessonFolder}
              handleFileAddPress={this.addLesson}
            />
          </div>
        );
      case 'watchlesson':
        return (
          <div>
            <HeaderWithLogo title="Watch Lessons" />
            <div className="lighter-grey-background" style={{ height: '80vh', padding: '2rem' }}>
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
              {this.renderCurrentlySelectedOption()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
