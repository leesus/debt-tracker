angular.module('debttracker')
  .controller('SignupCtrl', ['$scope', 'session', function($scope, session){
    $scope.signup = function() {
      session.signup({
        email: $scope.email,
        password: $scope.password
      });
    };
  }]);