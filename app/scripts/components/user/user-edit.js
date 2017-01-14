import template from './user-edit.html';
import './user-edit.scss';

export default function userEdit() {
  return {
    restrict: 'E',
    template: template,
    scope: {},
    bindToController: {
      user: '=',
      onRemove: '&',
      onSave: '&',
      errors: '=',
      initial: '='
    },
    controller: UserEditController,
    controllerAs: '$ctrl'
  };
}

// @ngInject
class UserEditController {
  constructor($q, $filter) {
    this.$q = $q;
    this.$filter = $filter;
  }
  save() {
    if (this.UserForm.$invalid) {
      return this.$q.reject();
    }
    return this.onSave();
  }

  getRegistrationMethod() {
    if (!this.user.registration_method) {
      return 'Default';
    } else if (this.user.registration_method === 'openid') {
      return 'Estonian ID';
    } else {
      return this.$filter('titleCase')(this.user.registration_method);
    }
  }
}
