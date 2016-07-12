var _dec, _class;



import { inject } from 'aurelia-dependency-injection';
import { AuthService } from './aurelia-authentication';

export var AuthenticatedValueConverter = (_dec = inject(AuthService), _dec(_class = function () {
  function AuthenticatedValueConverter(authService) {
    

    this.authService = authService;
  }

  AuthenticatedValueConverter.prototype.toView = function toView() {
    return this.authService.authenticated;
  };

  return AuthenticatedValueConverter;
}()) || _class);