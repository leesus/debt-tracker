angular.module('debttracker', ['ngCookies', 'ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap'])
  .config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider){
      /**
       * Check if user is logged in
       */
      /*var loggedIn = function($q, $timeout, $http, $location, $rootScope) {
        var deferred = $q.defer();

        $http.get('/api/loggedin')
      };*/

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
  }]);