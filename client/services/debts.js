angular.module('debttracker')
  .factory('Debt', ['$resource', function($resource) {
    var Debt = $resource('/api/debts/:action',
      { action: '@action' }, 
      { 'query':  {method:'GET', isArray: false }
    });

    Debt.prototype.archive = function() {
      this.archived = true;
      this.$save();
    };

    return Debt;
  }]);