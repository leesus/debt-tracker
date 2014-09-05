angular.module('debttracker')
  .controller('NavbarCtrl', ['$scope', '$route', '$location', 'session', function($scope, $route, $location, session) {

    $scope.isLoggedIn = false;

    $scope.logout = function() {
      session.logout();
    };

    $scope.$watch('currentUser', function(val) {
      $scope.isLoggedIn = !!val;
    });

    $scope.pages = [
      { path: '/', name: 'Home' },
      { path: '/owed', name: 'What I\'m owed', restricted: true },
      { path: '/owe', name: 'What I owe', restricted: true }
    ];

    $scope.isActive = function(viewLocation) {
      return viewLocation === $location.path();
    };
  }]);