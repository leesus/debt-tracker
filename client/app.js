angular.module('debttracker', ['ngCookies', 'ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap', 'ui.bootstrap'])
  .config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {

      // http://plnkr.co/edit/U7E2DC?p=info

      // Determine authentication
      var isLoggedIn = ['$q', 'session', function($q, session) {
        var deferred = $q.defer();

        if (session.isLoggedIn) {
          deferred.resolve();
        } else {
          deferred.reject({ needsAuthentication: true });
        }

        return deferred.promise;
        }
      ];

      // Extend $routeProvider
      $routeProvider.whenAuthenticated = function(path, route) {
        route.resolve = route.resolve || {};

        angular.extend(route.resolve, { isLoggedIn: isLoggedIn });

        return $routeProvider.when(path, route);
      };

      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/', { templateUrl: 'views/home.html', controller: 'HomeCtrl' })
        .when('/login', { templateUrl: 'views/login.html', controller: 'LoginCtrl' })
        .when('/signup', { templateUrl: 'views/signup.html', controller: 'SignupCtrl' })
        .whenAuthenticated('/account', { templateUrl: 'views/account.html', controller: 'AccountCtrl' })
        .whenAuthenticated('/owe', { templateUrl: 'views/owe.html', controller: 'OweCtrl' })
        .whenAuthenticated('/owed', { templateUrl: 'views/owed.html', controller: 'OwedCtrl as owed' })
        .otherwise({ redirectTo: '/' });
  }])
  .run(['$location', '$rootScope', '$window', 'session',
    function($location, $rootScope, $window, session) {

      // Assign window property for after auth
      // child window to interact with
      $window.debttracker = {
        authState: function(state, user) {
          $rootScope.$apply(function() {
            if (state == 'success') session.authSuccess(user);
            if (state == 'failure') session.authFailed();
          });
        }
      };

      // Reject route and redirect to login
      $rootScope.$on('$routeChangeError', function(e, current, previous, rejection) {
        if (rejection && rejection.needsAuthentication) {
          var returnUrl = $location.url();

          $location.path('/login').search({ returnUrl: returnUrl });
        }
      });
  }]);