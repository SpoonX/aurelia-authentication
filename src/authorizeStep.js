import {inject} from 'aurelia-dependency-injection';
import {Authentication} from './authentication';
import {Redirect} from 'aurelia-router';

@inject(Authentication)
export class AuthorizeStep {
  constructor(authentication) {
    this.authentication = authentication;
  }

  run(routingContext, next) {
    let isLoggedIn = this.authentication.isAuthenticated();
    let loginRoute = this.authentication.getLoginRoute();

    if (routingContext.getAllInstructions().some(i => i.config.auth)) {
      if (!isLoggedIn) {
        return next.cancel(new Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(i => i.fragment === loginRoute)) {
      let loginRedirect = this.authentication.getLoginRedirect();
      return next.cancel(new Redirect(loginRedirect));
    }

    return next();
  }
}
