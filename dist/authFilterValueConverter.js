import {RouteConfig} from 'aurelia-router';

export class AuthFilterValueConverter {
  /**
   * route toView predictator on route.config.auth === isAuthenticated
   * @param  {RouteConfig}  routes            the routes array to convert
   * @param  {boolean}      isAuthenticated   authentication status
   * @return {boolean}      show/hide element
   */
  toView(routes: RouteConfig, isAuthenticated: boolean): boolean {
    return routes.filter(route => typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated);
  }
}
