angular.module('debttracker')
  .factory('session', ['$rootScope', '$window', '$http', '$cookieStore', '$alert', '$location',
    function($rootScope, $window, $http, $cookieStore, $alert, $location) {
      var session = {
        init: function() {
          console.log('hello')
          $rootScope.currentUser = this.currentUser = $cookieStore.get('user');
          $rootScope.isLoggedIn = this.isLoggedIn = !!this.currentUser;
          $cookieStore.remove('user');
        },
        reset: function() {
          $rootScope.currentUser = this.currentUser = null;
          $rootScope.isLoggedIn = this.isLoggedIn = false;
          $cookieStore.remove('user');
        },
        oauthLogin: function(provider) {
          var url = '/api/auth/' + provider;
          var width = 500;
          var height = 500;
          var top = ($window.outerHeight - height) / 2;
          var left = ($window.outerWidth - width) / 2;

          $window.open(url, provider + '_login', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
        },
        login: function(user) {
          var _this = this;

          $http.post('/api/account/login', user)
            .success(function(res) {
              if (res.success) {
                _this.authSuccess(res.data, 'You have successfully logged in.');
              } else {
                _this.authFailed('Invalid username or password.');
              }
            });
        },
        signup: function(user) {
          var _this = this;

          $http.post('/api/account/signup', user)
            .success(function(res){
              _this.authSuccess(res.data, 'Your account has been created.');
            })
            .error(function(res){
              console.log(res)
              _this.authFailed('Sorry, there was an error while trying to create your account.');
            });
        },
        logout: function() {
          var _this = this;

          $http.get('/api/account/logout').success(function() {
            _this.reset();

            $alert({
              content: 'You have been logged out.',
              placement: 'top-right',
              type: 'info',
              duration: 3
            });

            $location.path('/');
          });
        },
        authSuccess: function(user, message) {
          $rootScope.currentUser = this.currentUser = user;
          $rootScope.isLoggedIn = this.isLoggedIn = true;

          $location.path('/');

          $alert({
            content: message || 'You have successfully logged in.',
            placement: 'top-right',
            type: 'success',
            duration: 3
          });
        },
        authFailed: function(message) {
          this.reset();

          $alert({
            content: message || 'There was an error logging you in, please try again.',
            placement: 'top-right',
            type: 'danger',
            duration: 3
          });
        }
      };

      session.init();

      return session;
    }]);