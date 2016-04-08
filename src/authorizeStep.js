import {inject} from 'aurelia-dependency-injection';
import {Authentication} from './authentication';
import {Redirect} from 'aurelia-router';

@inject(Authentication)
export class AuthorizeStep {
  constructor(authentication) {
    this.authentication = authentication;
  }

  run(routingContext, next) {
    const isLoggedIn = this.authentication.isAuthenticated();
    const loginRoute = this.authentication.config.loginRoute;

    if (routingContext.getAllInstructions().some(i => i.config.auth)) {
      if (!isLoggedIn) {
        return next.cancel(new Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(i => i.fragment === loginRoute)) {
      return next.cancel(new Redirect( this.authentication.config.loginRedirect ));
    }

    return next();
  }
}
