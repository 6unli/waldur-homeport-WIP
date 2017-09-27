import expertRequestsService from './expert-requests-service';
import expertRequestsCustomerList from './expert-request-customer-list';
import expertRequestsProjectList from './expert-request-project-list';
import expertRequestState from './expert-request-state';
import expertRequestDetails from './expert-request-details';
import expertRequestHeader from './expert-request-header';
import expertRequestSummary from './expert-request-summary';
import expertRequestCreate from './expert-request-create';
import expertRequestCancel from './expert-request-cancel';
import expertRequestComplete from './expert-request-complete';
import expertRequestComplain from './expert-request-complain';
import expertRequestCreateTitle from './expert-request-create-title';
import expertRequestTabs from './expert-request-tabs';
import expertRequestButton from './expert-request-button';
import billingType from './billing-type';
import extendProjectDashborad from './extend-project-dashboard';

export default module => {
  module.service('expertRequestsService', expertRequestsService);
  module.component('billingType', billingType);
  module.component('expertRequestsCustomerList', expertRequestsCustomerList);
  module.component('expertRequestsProjectList', expertRequestsProjectList);
  module.component('expertRequestHeader', expertRequestHeader);
  module.component('expertRequestSummary', expertRequestSummary);
  module.component('expertRequestState', expertRequestState);
  module.component('expertRequestDetails', expertRequestDetails);
  module.component('expertRequestCancel', expertRequestCancel);
  module.component('expertRequestComplete', expertRequestComplete);
  module.component('expertRequestComplain', expertRequestComplain);
  module.component('expertRequestCreateTitle', expertRequestCreateTitle);
  module.component('expertRequestCreate', expertRequestCreate);
  module.component('expertRequestTabs', expertRequestTabs);
  module.component('expertRequestButton', expertRequestButton);
  module.run(extendProjectDashborad);
};
