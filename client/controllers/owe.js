angular.module('debttracker')
  .controller('OweCtrl', ['$scope', '$rootScope', function($scope, $rootScope){
    
    $scope.name = $rootScope.currentUser.displayName || $rootScope.currentUser.local.email;

  }]);