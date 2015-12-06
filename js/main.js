
var hpApp = angular.module('hpApp', ['ngRoute', 'elasticsearch', 'ngAnimate', 'ui.bootstrap']);

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
hpApp.service('esService', function (esFactory) {
  return esFactory({
    host: 'http://localhost:9200',
    log: 'trace'
  });
});


/*Controllers*/

/*********************/
/**Search Controller**/
/*********************/
hpApp.controller('SearchController', function($scope, esService) {
	
	/* for pagination */
	$scope.currentPage = 1;
	$scope.maxSize = 3;
	$scope.itemsPerPage=15;
	
	$scope.doSearch = function() {
		esService.search({
		  index: 'healthierprices',
		  type: 'products',
		  size: 15,
		  from: ($scope.currentPage == 1 ? 0 : (($scope.currentPage-1)*$scope.itemsPerPage)),
		  body: {
			query: {
			  match: {
				_all: $scope.query
			  }
			}
		  }
		}).then(function (response) {
			$scope.totalItems = response.hits.total;
			$scope.results = response.hits.hits;
		}, function (err) {
			console.trace(err.message);
		});
	}	

	$scope.pageChanged = function() {
		$scope.doSearch();
	};
  
	$scope.doFuzzy = function() {
		esService.search({
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
			esService.suggest({
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