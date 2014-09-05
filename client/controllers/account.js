angular.module('debttracker')
  .controller('AccountCtrl', ['$scope', '$rootScope', function($scope, $rootScope){
    
    $scope.name = $rootScope.currentUser.displayName || $rootScope.currentUser.local.email;

  }]);