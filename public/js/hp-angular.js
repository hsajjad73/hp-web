
var hpApp = angular.module('hpApp', ['ngRoute','elasticsearch','ui.bootstrap']);

/*Route Config*/
hpApp.config(['$routeProvider',
  function($routeProvider) {
	$routeProvider.
	  when('/', {
		templateUrl: 'views/search.html',
		controller: 'SearchController'
	  }).	  
	  when('/findStores/:prodId', {
		templateUrl: 'views/stores.html',
		controller: 'StoreController'
	  }).
	  otherwise({
		redirectTo: '/'
	  });
  }]);

/*Services*/
hpApp.service('client', function (esFactory) {
  return esFactory({
    host: 'http://localhost:9200',
    log: 'trace'
  });
});

/*Controllers*/

/*********************/
/**Search Controller**/
/*********************/
hpApp.controller('SearchController', function($scope, client) {
	$scope.doSearch = function() {
		client.search({
		  index: 'healthierprices',
		  type: 'products',
		  body: {
			query: {
			  match: {
				_all: $scope.query
			  }
			}
		  }
		}).then(function (resp) {
			$scope.results = resp;
		}, function (err) {
			console.trace(err.message);
		});
	}	
	//$scope.$watch('currentPage', function() {
		//$scope.doSearch($scope.currentPage);
	//});

	$scope.doFuzzy = function() {
		client.search({
			  index: 'healthierprices',
			  type: 'products',
			  body: {
			    query: {
			      multi_match: {
			        fields : ['descr', 'short'],
			        query : $scope.query,
			        fuzziness : 'AUTO'
			      }
			    }
			  }
			}).then(function (resp) {
				$scope.results = resp;
			}, function (err) {
			    console.trace(err.message);
			});
	}
	
	$scope.getSuggestions = function(val) {
			client.suggest({
			  index: 'keywords',
			  body: {
				    mySuggester : {
				        text : val,
				        completion : {
				            field : 'suggest',
							fuzzy : {
				                'fuzziness' : 2
				            }
				        }
				    }
			  }
			}).then(function(response){
			      return response.mySuggester.map(function(item){
			          return item.options.map(function(a){
			        	  return a.text});
			      });
				}, function (err) {
			    console.trace(err.message);
			});
	}
});

/*********************/
/**Store Controller***/
/*********************/
hpApp.controller('StoreController', function($scope, $routeParams, $http) {
	
	$scope.prodId = $routeParams.prodId;
	
	$http({
		method: 'GET',
		url: 'http://localhost:8080/healthy/products/'+ $routeParams.prodId
	}).then(function successCallback(response) {
		$scope.results = response.data;
	  }, function errorCallback(response) {
		console.trace(response.message);
	  });
});