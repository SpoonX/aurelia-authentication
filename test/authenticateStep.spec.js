import {Container} from 'aurelia-dependency-injection';

import {AuthenticateStep} from '../src/authenticateStep';


const routes = {
  onLoginRoute : [
    {name: 'parent', fragment: '/login', config: {}},
    {name: 'child', fragment: 'childUrl', config: {}}
  ],
  authenticateNone : [
    {name: 'parent', fragment: 'parentUrl', config: {}},
    {name: 'child', fragment: 'childUrl', config: {}}
  ],
  authenticateChild : [
    {name: 'parent', fragment: 'parentUrl', config: {}},
    {name: 'child', fragment: 'childUrl', config: {auth: true}}
  ],
  authenticateParent : [
    {name: 'parent', fragment: 'parentUrl', config: {auth: true}},
    {name: 'child', fragment: 'childUrl', config: {}}
  ]};

describe('AuthenticateStep', () => {
  describe('.run()', () => {
    const authenticateStep = new Container().get(AuthenticateStep);
    let loginRoute = authenticateStep.authService.config.loginRoute;

    beforeEach(() => {
      authenticateStep.authService.authenticated = false;
    });
    afterEach(() => {
      authenticateStep.authService.authenticated = false;
    });

    it('should not redirect when not authenticated and no route requires it', () => {
      let routingContext = {
        getAllInstructions: () => routes.authenticateNone
      };

      function next() {return;}
      next.cancel = redirect => {throw new Error();};
      spyOn(next, 'cancel');

      authenticateStep.run(routingContext, next);

      expect(next.cancel).not.toHaveBeenCalled();
    });

    it('should redirect to login when not authenticated and child route requires it', done => {
      let routingContext = {
        getAllInstructions: () => routes.authenticateChild
      };

      function next() {return;}
      next.cancel = redirect => {
        expect(redirect.url).toBe(loginRoute);
        done();
      };

      authenticateStep.run(routingContext, next);
    });

    it('should redirect to login when not authenticated and parent route requires it', done => {
      let routingContext = {
        getAllInstructions: () => routes.authenticateParent
      };

      function next() {return;}
      next.cancel = redirect => {
        expect(redirect.url).toBe(loginRoute);
        done();
      };

      authenticateStep.run(routingContext, next);
    });

    it('should not redirect to login when authenticated and no route requires it', () => {
      let routingContext = {
        getAllInstructions: () => routes.authenticateNone
      };

      function next() {return;}
      next.cancel = redirect => {throw new Error();};
      spyOn(next, 'cancel');

      authenticateStep.authService.authenticated = true;

      authenticateStep.run(routingContext, next);

      expect(next.cancel).not.toHaveBeenCalled();
    });

    it('should not redirect when authenticated and child route requires it', ()  => {
      let routingContext = {
        getAllInstructions: () => routes.authenticateChild
      };

      function next() {return;}
      next.cancel = redirect => {throw new Error();};
      spyOn(next, 'cancel');

      authenticateStep.authService.authenticated = true;

      authenticateStep.run(routingContext, next);

      expect(next.cancel).not.toHaveBeenCalled();
    });

    it('should not redirect when not authenticated and parent route requires it', () => {
      let routingContext = {
        getAllInstructions: () => routes.authenticateParent
      };

      function next() {return;}
      next.cancel = redirect => {throw new Error();};
      spyOn(next, 'cancel');

      authenticateStep.authService.authenticated = true;

      authenticateStep.run(routingContext, next);

      expect(next.cancel).not.toHaveBeenCalled();
    });

    it('should redirect when  authenticated and parent route is login route', done => {
      let routingContext = {
        getAllInstructions: () => routes.onLoginRoute
      };

      function next() {return;}
      next.cancel = redirect => {
        expect(redirect.url).toBe(authenticateStep.authService.config.loginRedirect);
        done();
      };

      authenticateStep.authService.authenticated = true;

      authenticateStep.run(routingContext, next);
    });
  });
});
