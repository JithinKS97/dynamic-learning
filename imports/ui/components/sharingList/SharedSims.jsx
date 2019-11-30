import React from 'react';
import {
  Dimmer, Loader,
} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { SimsIndex } from '../../../api/sims';
import SearchBar from './SearchBar';

export default class SharedSims extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sims: [],
      loading: true,
      _idToNameMappings: {},
    };
    this.displaySims.bind(this);
  }

  componentDidMount() {
    this.simsTracker = Tracker.autorun(() => {
      const simsHandle = Meteor.subscribe('sims.public');
      const loading = !simsHandle.ready();

      this.setState({
        sims: SimsIndex.search('').fetch(),
        loading,
      }, () => {
        const { sims } = this.state;
        Meteor.call('getUsernames', sims.map(sim => sim.userId), (err, users) => {
          const _idToNameMappings = {};
          users.map((user) => {
            _idToNameMappings[user.userId] = user.username;
          });
          this.setState({
            _idToNameMappings,
          });
        });
      });
    });
  }

  componentWillUnmount() {
    this.simsTracker.stop();
  }

  findTime = time => moment(time);

  displayTime = (index) => {
    const { sims } = this.state;
    if (sims.length > 0) {
      return this.findTime(sims[index].createdAt).fromNow();
    }
  }

  displaySims = () => {
    const { sims, _idToNameMappings } = this.state;
    const { getNode } = this.props;

    return sims.map((sim, index) => (
      <div
        className="sharedResources__listItem"
        style={{ width: '100%', margin: '0' }}
        key={sim.createdAt}
        onClick={() => {
          getNode(sim);
        }}
      >
        <div className="sharedResources__listItem-title">
          {sim.title}
        </div>

        <div className="sharedResources__listItem-detail">
          <div>
            {_idToNameMappings[sim.userId]}
          </div>
          <div>
            {this.displayTime(index)}
          </div>
        </div>

      </div>

    ));
  }

  search = (searchTag) => {
    Tracker.autorun(() => {
      this.setState({ sims: SimsIndex.search(searchTag).fetch() });
    });
  }

  render() {
    const { loading } = this.state;
    return (
      <div>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
        <div className="lighter-grey-background" style={{ position: 'sticky', top: 0, padding: '1rem 0' }}>
          <SearchBar onChange={this.search} />
        </div>
        <div style={{ padding: '1rem 2rem' }}>
          {this.displaySims()}
        </div>
      </div>
    );
  }
}

SharedSims.propTypes = {
  getNode: PropTypes.func.isRequired,
};
