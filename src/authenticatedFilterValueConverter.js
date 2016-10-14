import {inject} from 'aurelia-dependency-injection';
import {AuthService} from './aurelia-authentication';
import {RouteConfig} from 'aurelia-router';

@inject(AuthService)
export class AuthenticatedFilterValueConverter {
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * route toView predictator on route.config.auth === (parameter || authService.isAuthenticated())
   * @param  {RouteConfig}  routes            the routes array to convert
   * @param  {[boolean]}    [isAuthenticated] optional isAuthenticated value. default: this.authService.authenticated
   * @return {boolean}      show/hide element
   */
  toView(routes: RouteConfig, isAuthenticated: boolean = this.authService.authenticated): boolean {
    return routes.filter(route => typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated);
  }
}
