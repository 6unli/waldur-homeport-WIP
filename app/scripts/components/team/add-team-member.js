import template from './add-team-member.html';

const addTeamMember = {
  template,
  bindings: {
    close: '&',
    resolve: '<'
  },
  controller: class AddTeamMemberDialogController {
    constructor(customerPermissionsService, projectPermissionsService, blockUI, $q, ENV, ErrorMessageFormatter, $filter) {
      // @ngInject
      this.$q = $q;
      this.customerPermissionsService = customerPermissionsService;
      this.projectPermissionsService = projectPermissionsService;
      this.blockUI = blockUI;
      this.ENV = ENV;
      this.ErrorMessageFormatter = ErrorMessageFormatter;
      this.$filter = $filter;
    }

    $onInit() {
      this.roles = this.ENV.roles;
      this.addText = 'Save';
      this.addTitle = 'Edit';
      this.helpText = this.$filter('translate')('You cannot change your own role');
      this.userModel = {
        expiration_time: null
      };

      this.roleField = {
        name: 'role',
        choices: [
          { value: 'admin', display_name: this.ENV.roles.admin },
          { value: 'manager', display_name: this.ENV.roles.manager },
        ]
      };
      this.expirationTimeField = {
        name: 'expiration_time',
        options: {
          format: 'dd.MM.yyyy',
          altInputFormats: ['M!/d!/yyyy'],
          dateOptions: {
            minDate: moment().add(1, 'days').toDate(),
            startingDay: 1
          }
        }
      };
      this.projects = [];

      this.formatData();
    }

    formatData() {
      this.userModel.user = this.resolve.editUser;
      this.userModel.role = this.resolve.editUser.role;
      this.userModel.expiration_time = this.resolve.editUser.expiration_time ?
        new Date(this.resolve.editUser.expiration_time) :
        null;

      this.projects = this.resolve.currentCustomer.projects.map(project => {
        this.resolve.editUser.projects.some(permissionProject => {
          project.role = null;
          project.permission = null;
          project.expiration_time = null;
          if (permissionProject.uuid === project.uuid) {
            project.role = permissionProject.role;
            project.permission = permissionProject.permission;
            project.expiration_time = permissionProject.expiration_time ?
              new Date(permissionProject.expiration_time) :
              null;
          }
          return permissionProject.uuid === project.uuid;
        });
        return project;
      });

      this.emptyProjectList = !this.projects.length;
      this.canChangeRole = this.resolve.currentUser.is_staff ||
        this.resolve.editUser.uuid !== this.resolve.currentUser.uuid;
    }

    saveUser() {
      this.errors = [];
      let block = this.blockUI.instances.get('add-team-member-dialog');
      block.start({delay: 0});

      return this.$q.all([
        this.saveCustomerPermission(),
        this.saveProjectPermissions()
      ]).then(() => {
        block.stop();
        this.close();
      }, error => {
        block.stop();
        this.errors = this.ErrorMessageFormatter.formatErrorFields(error);
      });
    }

    saveCustomerPermission() {
      let model = {};
      model.url = this.resolve.editUser.permission;
      model.expiration_time = this.userModel.expiration_time;

      if (this.userModel.role !== this.resolve.editUser.role && !this.userModel.role) {
        return this.customerPermissionsService.deletePermission(this.resolve.editUser.permission);
      } else if (this.userModel.expiration_time !== this.resolve.editUser.expiration_time) {
        return this.customerPermissionsService.update(model);
      }
    }

    saveProjectPermissions() {
      let updatePermissions = [],
        createdPermissions = [],
        permissionsToDelete = [];

      this.projects.forEach(project => {
        let exists = false,
          update = false,
          deletePermissionUrl = null;
        this.resolve.editUser.projects.forEach(existingPermission => {
          if (project.permission === existingPermission.permission) {
            exists = true;
            if (project.role === existingPermission.role &&
              project.expiration_time !== existingPermission.expiration_time) {
              update = true;
            } else {
              deletePermissionUrl = existingPermission.permission;
            }
          }
        });

        if (exists) {
          if (update) {
            updatePermissions.push(project);
          } else {
            permissionsToDelete.push(deletePermissionUrl);
            createdPermissions.push(project);
          }
        } else {
          if (project.role) {
            createdPermissions.push(project);
          }
        }
        deletePermissionUrl = null;
      });

      let removalPromises = permissionsToDelete.map(permission => {
        return this.projectPermissionsService.deletePermission(permission);
      });

      let renewalPromises = updatePermissions.map(permission => {
        let model = {};
        model.role = permission.role;
        model.expiration_time = permission.expiration_time;
        model.url = permission.permission;
        return this.projectPermissionsService.update(model);
      });

      return this.$q.all(removalPromises).then(() => {
        let creationPromises = createdPermissions.map(permission => {
          let instance = this.projectPermissionsService.$create();
          instance.user = this.resolve.editUser.url;
          instance.role = permission.role;
          instance.project = permission.url;
          instance.expiration_time = permission.expiration_time;
          return instance.$save();
        });
        return this.$q.all(renewalPromises.concat(creationPromises));
      });
    }
  }
};

export default addTeamMember;
