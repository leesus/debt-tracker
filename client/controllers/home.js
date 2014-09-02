angular.module('debttracker')
  .controller('HomeCtrl', ['$scope', '$rootScope', function($scope, $rootScope){
    
    $scope.welcome = 'Welcome to DebtTracker';
    console.log($rootScope.currentUser)

  }]);