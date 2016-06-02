import {inject} from 'aurelia-dependency-injection';
import {AuthService} from './authService';

@inject(AuthService)
export class AuthFilterValueConverter {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * route toView predictator on route.config.auth === (parameter || authService.isAuthenticated())
   * @param  {RouteConfig}  routes            the routes array to convert
   * @param  {[Boolean]}    [isAuthenticated] optional isAuthenticated value. default: this.authService.authenticated
   * @return {Boolean}      show/hide element
   */
  toView(routes, isAuthenticated = this.authService.authenticated) {
    return routes.filter(route => route.config.auth === isAuthenticated);
  }
}
