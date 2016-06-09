var _dec, _class;

import { inject } from 'aurelia-dependency-injection';
import { AuthService } from './aurelia-authentication';

export let AuthenticatedValueConverter = (_dec = inject(AuthService), _dec(_class = class AuthenticatedValueConverter {
  constructor(authService) {
    this.authService = authService;
  }

  toView() {
    return this.authService.authenticated;
  }
}) || _class);