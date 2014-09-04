angular.module('debttracker')
  .controller('LoginCtrl', ['$scope', 'session', function($scope, session){
    $scope.login = function() {
      session.login({
        email: $scope.email,
        password: $scope.password
      });
    };

    $scope.facebookLogin = function() {
      console.log('calling facebook login')
      session.oauthLogin('facebook');
    };
  }]);