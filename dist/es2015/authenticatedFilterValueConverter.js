var _dec, _class;

import { inject } from 'aurelia-dependency-injection';
import { AuthService } from './aurelia-authentication';
import { RouteConfig } from 'aurelia-router';

export let AuthenticatedFilterValueConverter = (_dec = inject(AuthService), _dec(_class = class AuthenticatedFilterValueConverter {
  constructor(authService) {
    this.authService = authService;
  }

  toView(routes, isAuthenticated = this.authService.authenticated) {
    return routes.filter(route => typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated);
  }
}) || _class);