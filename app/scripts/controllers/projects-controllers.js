'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController',
      ['$rootScope', 'projectsService', 'projectPermissionsService', 'resourcesService', ProjectListController]);

  function ProjectListController($rootScope, projectsService, projectPermissionsService, resourcesService) {
    var vm = this;

    vm.list = {};
    vm.deleteProject = deleteProject;
    vm.service = projectsService;

    // search
    vm.searchInput = '';
    vm.search = search;

    vm.showMore = showMore;

    $rootScope.$on('currentCustomerUpdated', function() {
      projectsService.page = 1;
      activate();
    });

    function showMore(project) {
      if (!project.users) {
        projectPermissionsService.getList({project:project.uuid}).then(function(reponse) {
          project.users = reponse;
        });
      }
      if (!project.resources) {
        resourcesService.getList({project:project.uuid}).then(function(reponse) {
          project.resources = reponse;
        });
      }
    }

    function deleteProject(project) {
      var index = vm.list.indexOf(project);
      var confirmDelete = confirm('Confirm project deletion?');
      if (confirmDelete) {
        projectsService.$delete(project.uuid).then(
          function(response) {
            vm.list.splice(index, 1);
          },
          handleProjectDeletionException
        );
      } else {
        alert('Project was not deleted.');
      }
    }

    function handleProjectDeletionException(response) {
      var message = response.data.status || response.data.detail;
      alert(message);
    }

    function search() {
      projectsService.getList({name: vm.searchInput}).then(function(response) {
        vm.list = response;
      });
    }

    function activate() {
      initList();
    }

    function initList() {
      projectsService.getList().then(function(response) {
        vm.pages = projectsService.pages;
        vm.list = response;
      });
    }

    $rootScope.$on('currentCustomerUpdated', function () {
      initList();
    });

    activate();

  }

  angular.module('ncsaas')
    .controller('ProjectAddController', ['$state', 'projectsService', 'customersService', ProjectAddController]);

  function ProjectAddController($state, projectsService, customersService) {
    var vm = this;

    vm.project = projectsService.$create();
    vm.customersList = customersService.getCustomersList();
    vm.save = save;

    function save() {
      // TODO: refactor this function to use named urls and uuid field instead - SAAS-108
      vm.project.$save(function() {
        var url = vm.project.url,
          array = url.split ('/').filter(function(el) {
            return el.length !== 0;
          }),
          uuidNew = array[4];
        $state.go('projects.details', {uuid:uuidNew});
      });
    }

  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      'projectsService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController($stateParams, $rootScope, projectsService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.project = null;
    projectsService.$get($stateParams.uuid).then(function(response) {
      vm.project = response;
    });
    vm.update = update;

    function update() {
      vm.project.$update();
    }

  }

})();

(function() {

  angular.module('ncsaas')
    .controller('UserAddToProject', ['usersService',
     '$stateParams', 'projectsService', 'projectPermissionsService', '$state', addToProject]);

  function addToProject(usersService, $stateParams, projectsService, projectPermissionsService, $state) {
    var vm = this;

    vm.users = [];
    vm.project = null;
    vm.usersInvited = [];
    vm.userInviteEmail = null;
    vm.addUser = addUser;
    vm.addUsersToProject = addUsersToProject;
    vm.userInvitedRemove = userInvitedRemove;
    projectsService.$get($stateParams.uuid).then(function(response) {
      vm.project = response;
      usersService.getRawUserList({project: vm.project.name}).$promise.then(function(response) {
        vm.users = response;
      });
    });

    function addUser() {
      var userEmail = vm.userInviteEmail;
      if (userEmail) {
        usersService.getRawUserList({email: userEmail}).$promise.then(function(response) {
          var user = response[0];
          var userForInvite = {
            email: userEmail,
            user: user
          };
          if (!user) {
            userForInvite.errors = userEmail + ' is not exist';
          }
          vm.usersInvited.push(userForInvite);
          vm.userInviteEmail = '';
        });
      }
    }

  function addUsersToProject() {
    var errorsCount = 0;
    for (var i = 0; vm.usersInvited.length > i; i++) {
      var user = vm.usersInvited[i].user;
      if (user) {
        var instance = projectPermissionsService.$create();
        instance.project = vm.project.url;
        instance.role = 'manager';
        instance.user = user.url;
        var success = function() {
          if (vm.usersInvited.length == i && errorsCount === 0) {
            $state.go('projects.details', {uuid: vm.project.uuid});
          }
        };
        var error = function(usersInvited, errors) {
          usersInvited.errors = errors.data ? errors.data.non_field_errors : [];
          errorsCount++;
        }.bind(null, vm.usersInvited[i]);
        instance.$save(success, error);
      }
    }
  }

  function userInvitedRemove(user) {
    var index = vm.usersInvited.indexOf(user);

    vm.usersInvited.splice(index, 1);
   }

  }
})();
