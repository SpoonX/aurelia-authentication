import {inject} from 'aurelia-dependency-injection';
import {AuthService} from './aurelia-authentication';

@inject(AuthService)
export class AuthenticatedValueConverter {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * element toView predictator on authService.isAuthenticated()
   * @return {boolean}  show/hide element
   */
  toView() {
    return this.authService.authenticated;
  }
}
