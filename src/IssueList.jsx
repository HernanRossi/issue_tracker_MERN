import React from 'react';
import 'whatwg-fetch';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IssueAdd from './IssueAdd';
import IssueFilter from './IssueFilter';

const IssueRow = props => (
  <tr>
    <td><Link to={`/issues/${props.issue._id}`}>{props.issue._id.substr(-4)}</Link></td>
    <td>{props.issue.status}</td>
    <td>{props.issue.owner}</td>
    <td>{props.issue.created.toDateString()}</td>
    <td>{props.issue.effort}</td>
    <td>{props.issue.completionDate ? props.issue.completionDate.toDateString() : ''}</td>
    <td>{props.issue.title}</td>
  </tr>
);

function IssueTable(props) {
  const issueRows = props.issues.map(issue => <IssueRow key={issue._id} issue={issue} />);
  return (
    <table className="bordered-table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Completion Date</th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>{issueRows}</tbody>
    </table>
  );
}

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };

    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const oldQuery = prevProps.location;
    const newQuery = this.props.location;
    if (newQuery.status !== undefined && oldQuery.status !== undefined) {
      if (oldQuery.status === newQuery.status) {
         return;
      }
    }
    this.loadData();
  }

  loadData() {
    fetch(`/api/issues${this.props.location.search}`)
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              console.log('Total count of records:', data._metadata.total_count);
              data.records.forEach((issue) => {
                issue.created = new Date(issue.created);
                if (issue.completionDate) {
                  issue.completionDate = new Date(issue.completionDate);
                }
              });
              this.setState({ issues: data.records });
            });
        } else {
          response.json()
            .then((error) => {
              alert(`Failed to fetch issues: ${error.message}`);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  createIssue(newIssue) {
    fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIssue),
    })
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((updatedIssue) => {
              updatedIssue.created = new Date(updatedIssue.created);
              if (updatedIssue.completionDate) {
                updatedIssue.completionDate = new Date(updatedIssue.completionDate);
              }
              const newIssues = this.state.issues.concat(updatedIssue);
              this.setState({ issues: newIssues });
            });
        } else {
          response.json()
            .then()
            .catch((err) => {
              alert(`Error in sending data to server: ${err.message}`);
            });
        }
      })
      .catch((err) => {
        alert(`Error in sending data to server: ${err.message}`);
      });
  }

  render() {
    return (
      <div>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={this.state.issues} />
        <hr />
        <IssueAdd createIssue={this.createIssue} />
      </div>
    );
  }
}

IssueList.propTypes = {
  location: PropTypes.object.isRequired,
};

IssueRow.propTypes = {
  issue: PropTypes.object,
  _id: PropTypes.any,
  status: PropTypes.string,
  owner: PropTypes.string,
  created: PropTypes.string,
  effort: PropTypes.number,
  completionDate: PropTypes.string,
  title: PropTypes.string,
};

IssueRow.defaultProps = {
  issue: null,
  _id: null,
  status: 'Inactive',
  owner: 'John Doe',
  created: '2017-12-12',
  effort: 0,
  completionDate: '2017-12-12',
  title: 'New Issue',
};

IssueTable.propTypes = {
  issues: PropTypes.array,
  map: PropTypes.func,
};

IssueTable.defaultProps = {
  issues: [],
  map: null,
};
