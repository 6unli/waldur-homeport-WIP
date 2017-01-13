import template from './user-details.html';

export default function userDetails() {
  return {
    restrict: 'E',
    template: template,
    controller: UserDetailsController,
  };
}

export const PRIVATE_USER_TABS = [
  {
    label: 'Dashboard',
    icon: 'fa-th-large',
    link: 'profile.details'
  },
  {
    label: 'Audit logs',
    icon: 'fa-bell-o',
    link: 'profile.events'
  },
  {
    label: 'SSH Keys',
    icon: 'fa-key',
    link: 'profile.keys'
  },
  {
    label: 'Notifications',
    icon: 'fa-envelope',
    link: 'profile.notifications',
    feature: 'notifications'
  },
  {
    label: 'Manage',
    icon: 'fa-wrench',
    link: 'profile.manage'
  }
];

// @ngInject
function UserDetailsController($scope, $state, $stateParams, usersService,
  PRIVATE_USER_TABS, stateUtilsService, currentStateService, WorkspaceService) {
  var publicTabs = [
    {
      label: 'Audit logs',
      icon: 'fa-bell-o',
      link: 'users.details({uuid: $ctrl.context.user.uuid})'
    },
    {
      label: 'SSH Keys',
      icon: 'fa-key',
      link: 'users.keys({uuid: $ctrl.context.user.uuid})'
    }
  ];
  var dashboardTab;
  var prevWorkspace = stateUtilsService.getPrevWorkspace() || 'organization';
  if (prevWorkspace === 'project') {
    dashboardTab = {
      label: 'Back to project',
      icon: 'fa-arrow-left',
      action: stateUtilsService.goBack
    };
  } else if (currentStateService.getOwnerOrStaff()) {
    dashboardTab = {
      label: 'Back to organization',
      icon: 'fa-arrow-left',
      action: stateUtilsService.goBack
    };
  }

  function updateSidebar() {
    WorkspaceService.setWorkspace({
      hasCustomer: true,
      workspace: 'user',
    });
    usersService.getCurrentUser().then(function(user) {
      if (angular.isUndefined($stateParams.uuid) || $stateParams.uuid === user.uuid) {
        if (dashboardTab) {
          $scope.items = [dashboardTab].concat(PRIVATE_USER_TABS);
        } else {
          $scope.items = PRIVATE_USER_TABS;
        }
        $scope.isPrivate = true;
        $scope.currentUser = user;
        $scope.context = {user: user};
      } else {
        usersService.$get($stateParams.uuid).then(function(user) {
          if (dashboardTab) {
            $scope.items = [dashboardTab].concat(publicTabs);
          } else {
            $scope.items = publicTabs;
          }
          $scope.currentUser = user;
          $scope.isPrivate = false;
          $scope.context = {user: user};
        }).catch(function(response) {
          if (response.status === 404) {
            $state.go('errorPage.notFound');
          }
        });
      }
    });
  }
  $scope.$on('hasCustomer', updateSidebar);
  // $scope.$on('ownerOrStaff', updateSidebar);
  updateSidebar();
}
