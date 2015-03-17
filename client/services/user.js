angular.module('debttracker')
  .factory('User', ['$resource', function($resource) {
    return $resource('/api/users/:id', 
      { id: '@id' },
      {
        'search': {
          method: 'GET',
          url: 'http://localhost:3000/api/users/search/:query',
          params: {
            query: '@query'
          }
        }
      })
  }]);