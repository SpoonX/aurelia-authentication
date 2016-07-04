var _dec, _class;



import { inject } from 'aurelia-dependency-injection';
import { AuthService } from './aurelia-authentication';

export var AuthenticatedFilterValueConverter = (_dec = inject(AuthService), _dec(_class = function () {
  function AuthenticatedFilterValueConverter(authService) {
    

    this.authService = authService;
  }

  AuthenticatedFilterValueConverter.prototype.toView = function toView(routes) {
    var isAuthenticated = arguments.length <= 1 || arguments[1] === undefined ? this.authService.authenticated : arguments[1];

    return routes.filter(function (route) {
      return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
    });
  };

  return AuthenticatedFilterValueConverter;
}()) || _class);