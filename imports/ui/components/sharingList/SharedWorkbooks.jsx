import React from 'react';
import {
  Modal, Button, Dimmer, Loader,
} from 'semantic-ui-react';
import { GoRepoForked } from 'react-icons/go';
import { Link } from 'react-router-dom';
import moment from 'moment';
import SearchBar from './SearchBar';
// eslint-disable-next-line import/no-named-as-default
import WorkbookViewer from '../workbook/WorkbookViewer';
import { WorkbooksIndex } from '../../../api/workbooks';

export default class SharedWorkbooks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      workbooks: [],
      workbook: null,
      loading: true,
      _idToNameMappings: {},
    };
    this.displayWorkbooks.bind(this);
  }

  componentDidMount() {
    this.workbooksTracker = Tracker.autorun(() => {
      const workbooksHandle = Meteor.subscribe('workbooks.public');
      const loading = !workbooksHandle.ready();

      this.setState(
        {
          workbooks: WorkbooksIndex.search('').fetch(),
          selectedWorkbook: null,
          loading,
        },
        () => {
          const { workbooks } = this.state;
          Meteor.call(
            'getUsernames',
            workbooks.map(workbook => workbook.userId),
            (_err, users) => {
              const _idToNameMappings = {};
              users.map((user) => {
                _idToNameMappings[user.userId] = user.username;
              });
              this.setState({
                _idToNameMappings,
              });
            },
          );
        },
      );
    });
  }

  componentWillUnmount() {
    this.workbooksTracker.stop();
  }

  findTime = time => moment(time);

  displayTime = (index) => {
    const { workbooks } = this.state;
    if (workbooks.length > 0) {
      return this.findTime(workbooks[index].createdAt).fromNow();
    }
  };

  displayWorkbooks = () => {
    const { workbooks, _idToNameMappings } = this.state;

    return workbooks.map((workbook, index) => (
      <div
        className="sharedResources__listItem"
        style={{ width: '100%', margin: 0 }}
        key={workbook.createdAt}
        onClick={() => {
          this.setState({
            selectedWorkbook: workbook,
          });
        }}
      >
        <div
          onClick={() => {
            this.setState({ workbook });
          }}
        >
          <div className="sharedResources__listItem-title">{workbook.title}</div>
          <div className="sharedResources__listItem-detail">
            <div>{_idToNameMappings[workbook.userId]}</div>
            <div style={{ marginLeft: '0.1rem' }}>
              {this.displayTime(index)}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  search = (searchTag) => {
    Tracker.autorun(() => {
      this.setState({
        workbooks: WorkbooksIndex.search(searchTag).fetch(),
      });
    });
  };

  getId = () => {
    const { selectedWorkbook } = this.state;
    if (!selectedWorkbook) {
      return;
    }

    if (selectedWorkbook.__originalId === undefined) {
      return selectedWorkbook._id;
    }
    return selectedWorkbook.__originalId;
  };

  render() {
    const {
      loading,
      workbook,
      _idToNameMappings,
      selectedWorkbook,
    } = this.state;
    return (
      <div>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
        <Modal
          open={!!workbook}
          size="fullscreen"
          style={{ transform: 'scale(0.7, 0.7)', marginTop: '10vh' }}
        >
          <Modal.Header style={{ transformOrigin: 'left' }}>
            Preview
            <div style={{ float: 'right' }}>
              <Link to={`/workbookeditor/${this.getId.bind(this)()}`}>
                <Button>Open</Button>
              </Link>

              {Meteor.userId() ? (
                <Button
                  onClick={() => {
                    const confirmation = confirm(
                      'Are you sure you want to fork this lesson?',
                    );

                    if (!confirmation) {
                      return;
                    }

                    Meteor.call(
                      'workbooks.insert',
                      workbook.title,
                      (err, _id) => {
                        if (!Meteor.userId()) {
                          return;
                        }

                        Meteor.call('workbooks.update', _id, workbook.slides);
                        this.setState({ workbook: null });
                        confirm('Lesson has been succesfully forked');
                      },
                    );
                  }}
                >
                  <GoRepoForked />
                  Fork
                </Button>
              ) : null}

              <Button
                onClick={() => {
                  this.setState({ workbook: null });
                }}
              >
                X
              </Button>
            </div>
          </Modal.Header>
          <Modal.Content>
            <WorkbookViewer _id={this.getId.bind(this)()} />
            <h3>
              {`Author: ${
                selectedWorkbook
                  ? _idToNameMappings[selectedWorkbook.userId]
                  : null
              }`}
            </h3>
          </Modal.Content>
        </Modal>
        <div
          className="lighter-grey-background"
          style={{
            position: 'sticky',
            top: 0,
            padding: '1rem',
          }}
        >
          <SearchBar onChange={this.search} />
        </div>
        <div style={{
          width: '100%',
          height: '100%',
          marginTop: '1.2rem',
          padding: '0 5rem',
        }}
        >
          {this.displayWorkbooks()}
        </div>
      </div>
    );
  }
}
