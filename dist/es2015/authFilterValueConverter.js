import { RouteConfig } from 'aurelia-router';

export let AuthFilterValueConverter = class AuthFilterValueConverter {
  toView(routes, isAuthenticated) {
    return routes.filter(route => typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated);
  }
};