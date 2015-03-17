angular.module('debttracker')
  .controller('OwedCtrl', ['$rootScope', '$scope', 'Debt', 'User', function($rootScope, $scope, Debt, User){
    var self = this;

    this.wizard = 0;
    this.debt = {};
    this.debts = [];


    /**
     * Search for existing users
     *
     * @param {string} val Email address or name
     * @return {array} users
     */
    this.findUsers = function(val) {
      return User.search({ query: val }).$promise.then(function(res) {
        var users = res.data;
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!users.length) {
          if (re.test(val)) {
            users.push({
              email: [val],
              isNoResult: true
            });
          } else {
            users.push({
              first_name: val,
              isNoResult: true
            });
          }
        }

        return users;
      });
    };

    /**
     * Given a user object, create new user for form
     *
     * @param {object} $item User object returned from search
     */
    this.createUserModel = function($item) {
      if ($item.isNoResult) {
        var names;
        var email;
        self.user = {};

        if ($item.first_name) {
          var names = $item.first_name.split(' ');
          self.user.first_name = names[0].charAt(0).toUpperCase() + names[0].slice(1);
          if (names.length > 1) self.user.last_name = names[names.length - 1].charAt(0).toUpperCase() + names[names.length - 1].slice(1);;
          self.user.display_name = self.user.first_name + ' ' + self.user.last_name;
        }
        if ($item.email) {
          self.user.email = $item.email[0];
          self.user.display_name = $item.email[0];
        }
        self.wizard = 2;
      } else {
        self.user = $item;
        self.wizard = 3;
      }
    };

    /**
     * Create new user resource
     */
    this.addUser = function() {
      User.save(self.user, function(res) {
        self.user = res.data;
        self.debt.debtor = self.user._id;
        self.wizard = 3;
      });
    };

    /**
     * Create new debt resource
     */
    this.addDebt = function() {
      console.log(self.debt)
      Debt.save(self.debt, function(res) {
        self.debts.push(res.data);
        self.wizard = 0;
      });
    };

    /**
     * Find existing debts and populate debts array
     */
    Debt.query({ action: 'owed' }, function(res) {
      self.debts = res.data;
    });
  }]);