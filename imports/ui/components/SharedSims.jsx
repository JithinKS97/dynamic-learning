import React from 'react';
import {
  List, Input, Dimmer, Loader, Card,
} from 'semantic-ui-react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { SimsIndex } from '../../api/sims';

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
      <Card
        style={{ width: '100%', margin: '0' }}
        key={sim.createdAt}
        onClick={() => {
          getNode(sim);
        }}
      >
        <Card.Content>
          <Card.Header>
            {sim.title}
          </Card.Header>
          <Card.Meta style={{
            marginTop: '0.4rem', marginLeft: '0.4rem', display: 'flex', flexDirection: 'row',
          }}
          >
            <div>
              {_idToNameMappings[sim.userId]}
              {' | '}
            </div>
            <div>
                added
              {this.displayTime(index)}
            </div>
          </Card.Meta>
        </Card.Content>
      </Card>
    ));
  }

  search = (event, data) => {
    Tracker.autorun(() => {
      this.setState({ sims: SimsIndex.search(data.value).fetch() });
    });
  }

  render() {
    const { loading } = this.state;
    return (
      <div>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
        <Input ref={(e) => { this.searchTag = e; }} onChange={this.search} label="search" />
        <List selection verticalAlign="middle">
          {this.displaySims()}
        </List>
      </div>
    );
  }
}

SharedSims.propTypes = {
  getNode: PropTypes.func.isRequired,
};
