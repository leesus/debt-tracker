angular.module('debttracker')
  .factory('session', ['$rootScope', '$window', '$http', '$cookieStore', '$alert',
    function($rootScope, $window, $http, $cookieStore, $alert) {
      var session = {
        init: function() {
          this.reset();
        },
        reset: function() {
          this.currentUser = null;
          this.isLoggedIn = false;
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
                _this.authFailure('Invalid username or password.');
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
          });
        },
        authSuccess: function(user, message) {
          this.currentUser = user;
          this.isLoggedIn = true;

          $alert({
            content: message,
            placement: 'top-right',
            type: 'success',
            duration: 3
          });
        },
        authFailed: function(message) {
          this.resetSession();

          $alert({
            content: message,
            placement: 'top-right',
            type: 'danger',
            duration: 3
          });
        }
      };
    }]);