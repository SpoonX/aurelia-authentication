import {inject} from 'aurelia-dependency-injection';
import {AuthService} from './aurelia-authentication';

@inject(AuthService)
export class AuthenticatedFilterValueConverter {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * route toView predictator on route.config.auth === (parameter || authService.isAuthenticated())
   * @type  {RouteConfig}  routes            the routes array to convert
   * @type  {[Boolean]}    [isAuthenticated] optional isAuthenticated value. default: this.authService.authenticated
   * @return {Boolean}      show/hide element
   */
  toView(routes, isAuthenticated = this.authService.authenticated) {
    return routes.filter(route => typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated);
  }
}
