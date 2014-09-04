angular.module('debttracker')
  .controller('NavbarCtrl', ['$scope', 'session', function($scope, session) {
    $scope.logout = function() {
      session.logout();
    };
  }]);