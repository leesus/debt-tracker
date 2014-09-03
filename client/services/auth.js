angular.module('debttracker')
  .factory('Auth', ['$http', '$location', '$rootScope', '$cookieStore', '$alert', 
    function($http, $location, $rootScope, $cookieStore, $alert) {
      $rootScope.currentUser = $cookieStore.get('user');
      $cookieStore.remove('user');

      return {
        login: function(user) {
          return $http.post('/api/account/login', user)
            .success(function(res) {
              console.log(res)
              if (res.success) {
                $rootScope.currentUser = res.data;
                $location.path('/');
                $alert({
                  title: 'Cheers!',
                  content: 'You have successfully logged in.',
                  placement: 'top-right',
                  type: 'success',
                  duration: 3
                });
              } else {
                $alert({
                  title: 'Error!',
                  content: 'Invalid username or password.',
                  placement: 'top-right',
                  type: 'danger',
                  duration: 3
                });
              }
            });
        },
        signup: function(user) {
          return $http.post('/api/account/signup', user)
            .success(function(res){
              console.log(res)
              $rootScope.currentUser = res.data;
              $location.path('/');

              $alert({
                title: 'Congratulations!',
                content: 'Your account has been created.',
                placement: 'top-right',
                type: 'success',
                duration: 3
              });
            })
            .error(function(res){
              $alert({
                title: 'Error!',
                content: res.data,
                placement: 'top-right',
                type: 'danger',
                duration: 3
              });
            });
        },
        logout: function() {
          return $http.get('/api/account/logout').success(function() {
            $rootScope.currentUser = null;
            $cookieStore.remove('user');
            $alert({
                content: 'You have been logged out.',
                placement: 'top-right',
                type: 'info',
                duration: 3
              });
          });
        }
      }
    }]);