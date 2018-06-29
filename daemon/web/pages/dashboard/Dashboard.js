import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as dashboardActions from '../../actions/dashboard';
import TerminalView from '../../components/TerminalView/TerminalView';
import {
  Table,
  TableCell,
  TableRow,
  TableHeader,
  TableBody,
  TableRowExpandable,
} from '../../components/Table/Table';

const styles = {
  container: {
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  underConstruction: {
    textAlign: 'center',
    fontSize: 24,
    color: '#9f9f9f',
  },
};

class DashboardWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errored: false,
      logEntries: [],
      logReader: null,
    };
    this.getLogs = this.getLogs.bind(this);
    this.getMessage = this.getMessage.bind(this);
  }

  componentWillMount() {
    this.props.handleGetProjectDetails();
    this.props.handleGetContainers();
    this.props.handleGetLogs({ container: this.props.container });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.container !== this.props.container) {
    }
  }

  async getLogs() {
    if (this.state.logReader) await this.state.logReader.cancel();
    this.setState({
      errored: false,
      logEntries: [],
      logReader: null,
    });
  }

  getMessage() {
    if (this.state.errored) {
      return <p style={styles.underConstruction}>Yikes, something went wrong</p>;
    } else if (this.state.logEntries.length === 0) {
      return <p style={styles.underConstruction}>No logs to show</p>;
    }
    return null;
  }

  render() {
    const {
      name,
      branch,
      commit,
      message,
      buildType,
    } = this.props.project;

    return (
      <div style={styles.container}>
        <Table style={{ width: '90%', margin: '1rem' }}>
          <TableHeader>
            <TableRow>
              <TableCell>{name}</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell>Branch</TableCell>
              <TableCell>{branch}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Commit</TableCell>
              <TableCell>{commit}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Message</TableCell>
              <TableCell>{message}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Build Type</TableCell>
              <TableCell>{buildType}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table style={{ width: '90%', margin: '1rem' }}>
          <TableHeader>
            <TableRow>
              <TableCell>Type/Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* TODO: a foreach here */}
            <TableRowExpandable
              height={300}
              panel={<TerminalView logs={this.props.logs} />}>
              <TableCell>Commit</TableCell>
              <TableCell>{commit}</TableCell>
            </TableRowExpandable>

            <TableRow>
              <TableCell>Message</TableCell>
              <TableCell>{message}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Build Type</TableCell>
              <TableCell>{buildType}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

      </div>
    );
  }
}
DashboardWrapper.propTypes = {
  logs: PropTypes.array,
  container: PropTypes.string,
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    branch: PropTypes.string.isRequired,
    commit: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    buildType: PropTypes.string.isRequired,
  }),
  handleGetLogs: PropTypes.func,
  handleGetContainers: PropTypes.func,
  handleGetProjectDetails: PropTypes.func,
};

const mapStateToProps = ({ Dashboard }) => {
  return {
    project: Dashboard.project,
    logs: Dashboard.logs,
    containers: Dashboard.containers,
  };
};

const mapDispatchToProps = dispatch => bindActionCreators({ ...dashboardActions }, dispatch);

const Dashboard = connect(mapStateToProps, mapDispatchToProps)(DashboardWrapper);


export default Dashboard;
