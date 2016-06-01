import {inject} from 'aurelia-dependency-injection';
import {AuthService} from './authService';
import {Redirect} from 'aurelia-router';
import * as LogManager from 'aurelia-logging';

@inject(AuthService)
export class AuthorizeStep {
  constructor(authService) {
    LogManager.getLogger('authentication').warn('AuthorizeStep is deprecated. Use AuthenticationStep instead and add {settings: {authenticate: true}} to your router configuration.');

    this.authService = authService;
  }

  run(routingContext, next) {
    const isLoggedIn = this.authService.isAuthenticated();
    const loginRoute = this.authService.config.loginRoute;

    if (routingContext.getAllInstructions().some(i => i.config.auth)) {
      if (!isLoggedIn) {
        return next.cancel(new Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(i => i.fragment === loginRoute)) {
      return next.cancel(new Redirect( this.authService.config.loginRedirect ));
    }

    return next();
  }
}
