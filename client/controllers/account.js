angular.module('debttracker')
  .controller('AccountCtrl', ['$scope', '$rootScope', function($scope, $rootScope){
    
    $scope.name = $rootScope.currentUser.first_name || $rootScope.currentUser.local.email;

  }]);