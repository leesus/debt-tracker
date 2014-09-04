angular.module('debttracker', ['ngCookies', 'ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap'])
  .config(['$routeProvider', '$locationProvider', '$httpProvider', 
    function($routeProvider, $locationProvider, $httpProvider){
      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/', {
          templateUrl: 'views/home.html',
          controller: 'HomeCtrl'
        })
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .when('/signup', {
          templateUrl: 'views/signup.html',
          controller: 'SignupCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
  }])
  .run(['$rootScope', '$window', 'session',
    function($rootScope, $window, session) {
      $window.debttracker = {
        authState: function(state, user) {
          $rootScope.$apply(function() {
            if (state == 'success') session.authSuccess(user);
            if (state == 'failure') session.authFailed();
          });
        }
      };
  }]);