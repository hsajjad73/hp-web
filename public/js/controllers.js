var hpControllers = angular.module('hpControllers', []);	

hpControllers.controller('hpSearchCtrl', function($scope, client) {
	
	$scope.Math = window.Math;

    $scope.noOfPages = 1;
	$scope.currentPage = 1;
    $scope.maxSize = 5;
	
	$scope.doSearch = function(pageNum) {
		
//		if($scope.query == null)
//			return;

//		$scope.currentPage = pageNum;

		client.search({
			  index: 'healthierprices',
			  type: 'products',
			  //from: ($scope.currentPage - 1) * 10,
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

hpControllers.controller('hpStoreLookupCtrl', function($scope, $routeParams, $http) {
    
	$scope.prodId = $routeParams.prodId;
	$http({
  method: 'GET',
  url: 'http://ec2-52-19-171-139.eu-west-1.compute.amazonaws.com:8080/healthy/products/'+ $routeParams.prodId
}).then(function successCallback(response) {
    $scope.results = response.data;
  }, function errorCallback(response) {
    console.trace(response.message);
  });
});