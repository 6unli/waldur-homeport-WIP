import issuesListFiltered from './issues-list-filtered';
import issuesList from './issues-list';
import issuesShortList from './IssuesShortList';

export default module => {
  module.component('issuesListFiltered', issuesListFiltered);
  module.component('issuesList', issuesList);
  module.component('issuesShortList', issuesShortList);
};
