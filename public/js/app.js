
var app = angular.module('hpApp', ['elasticsearch', 'ngRoute', 'hpControllers']);

app.service('client', function (esFactory) {
  return esFactory({
    host: 'http://localhost:9200',
    log: 'trace'
  });
});

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/search.html',
        controller: 'hpSearchCtrl'
      }).
      when('/:prodId', {
        templateUrl: 'partials/store.html',
        controller: 'hpStoreLookupCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);