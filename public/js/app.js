
var app = angular.module('hpApp', ['elasticsearch', 'ngRoute', 'hpControllers', 'ui.bootstrap']);

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
        templateUrl: 'views/home.html',
        controller: 'hpSearchCtrl'
      }).
	  when('/search', {
        templateUrl: 'views/home.html',
        controller: 'hpSearchCtrl'
      }).	  
      when('/findStores/:prodId', {
        templateUrl: 'views/findStores.html',
        controller: 'hpStoreLookupCtrl'
      }).
      otherwise({
        redirectTo: 'views/error/404.html'
      });
  }]);