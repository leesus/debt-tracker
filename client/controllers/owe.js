angular.module('debttracker')
  .controller('OweCtrl', ['$scope', '$rootScope', function($scope, $rootScope){

    $scope.name = $rootScope.currentUser.first_name || $rootScope.currentUser.local.email;

  }]);