import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';

import InertiaAPI from '../../common/API';
import Containers from '../containers/Containers';
import Dashboard from '../dashboard/Dashboard';
import * as mainActions from '../../actions/main';

// hardcode all styles for now, until we flesh out UI
const styles = {
  container: {
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
    width: '100%',
  },

  innerContainer: {
    display: 'flex',
    flexFlow: 'row',
    height: '100%',
    width: '100%',
  },

  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '4rem',
    padding: '0 1.5rem',
    borderBottom: '1px solid #c1c1c1',
  },

  main: {
    height: '100%',
    width: '100%',
    overflowY: 'scroll',
  },
};

class MainWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.handleLogout = this.handleLogout.bind(this);
    this.handleGetStatus = this.handleGetStatus.bind(this);

    this.handleGetStatus()
      .then(() => {})
      .catch(() => {}); // TODO: Log error
  }

  async handleLogout() {
    const response = await InertiaAPI.logout();
    if (response.status !== 200) {
      // TODO: Log Error
      return;
    }
    this.props.history.push('/login');
  }

  async handleGetStatus() {
    const response = await InertiaAPI.getRemoteStatus();
    if (response.status !== 200) return new Error('bad response: ' + response);
    return null;
  }

  render() {
    return (
      <div style={styles.container}>

        <header style={styles.headerBar}>
          <p style={{
            fontWeight: 500,
            fontSize: 24,
            color: '#101010',
          }}>
            Inertia Web
          </p>

          <button
            onClick={this.handleLogout}
            style={{
              textDecoration: 'none',
              color: '#5f5f5f',
            }}>
            logout
          </button>

          <Link to={`${this.props.match.url}/dashboard`}>Click to go to Dashboard</Link>
          <Link to={`${this.props.match.url}/containers`}>Click to go to Containers</Link>
        </header>

        <div style={styles.innerContainer}>
          <div style={styles.main}>
            <Switch>
              <Route
                exact
                path={`${this.props.match.url}/dashboard`}
                component={() => <Dashboard />}
              />
              <Route
                exact
                path={`${this.props.match.url}/containers`}
                component={() => <Containers />}
              />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}
MainWrapper.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object,
};


const mapStateToProps = ({ Main }) => {
  return {
    testState: Main.testState,
  };
};

const mapDispatchToProps = dispatch => bindActionCreators({ ...mainActions }, dispatch);

const Main = connect(mapStateToProps, mapDispatchToProps)(MainWrapper);


export default Main;
