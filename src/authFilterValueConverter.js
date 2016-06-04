export class AuthFilterValueConverter {
  /**
   * route toView predictator on route.config.auth === isAuthenticated
   * @type  {RouteConfig}  routes            the routes array to convert
   * @type  {Boolean}      isAuthenticated   authentication status
   * @return {Boolean}      show/hide element
   */
  toView(routes, isAuthenticated) {
    return routes.filter(route => typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated);
  }
}
