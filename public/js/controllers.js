var hpControllers = angular.module('hpControllers', []);	

hpControllers.controller('hpSearchCtrl', function($scope, client) {
	
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
				$scope.results = resp.hits.hits;
			}, function (err) {
			    console.trace(err.message);
			});
	}
	
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
				$scope.results = resp.hits.hits;
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

hpControllers.controller('hpStoreLookupCtrl', function($scope, $routeParams, $http) {
    
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