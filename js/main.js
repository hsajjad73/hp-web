
var hpApp = angular.module('hpApp', ['ngRoute', 'elasticsearch', 'ngAnimate', 'ui.bootstrap', 'bootstrapLightbox'])
	.constant('HP_CONSTANTS', { 
		ELASTIC_URL: 'http://localhost:9200', 
		MULE_URL: 'http://localhost:8080/healthy/products/',
		IMGS_BASE_URL: 'http://www.healthierprices.co.uk/uploads/awsimage320/'
	})
	.run(function ($rootScope, HP_CONSTANTS) { // make in scope for all controllers
        $rootScope.HP_CONSTANTS = HP_CONSTANTS;
    });

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

/*Lightbox Image Modal plugin conf make compatible with Bootstrap4 CSS*/
hpApp.config(function (LightboxProvider, HP_CONSTANTS) {
  LightboxProvider.templateUrl = 'js/vendor/templates/lightbox.tpl';
  LightboxProvider.getImageUrl = function (image) {
    return HP_CONSTANTS.IMGS_BASE_URL + image;
  };
});

/*Override templateURL for Angular UI Tab to make compatible with Bootstrap4 CSS*/
hpApp.config(['$provide', Decorate]);
function Decorate($provide) {
$provide.decorator('uibTabDirective', function($delegate) {
  var directive = $delegate[0];

  directive.templateUrl = "js/vendor/templates/tab.tpl";

  return $delegate;
 });
}

/*Services*/
hpApp.service('esService', function (esFactory, HP_CONSTANTS) {
  return esFactory({
    host: HP_CONSTANTS.ELASTIC_URL,
    log: 'trace'
  });
});

/*Directives*/
hpApp.directive('focus', function() {
	return {
		link: function(scope, element, attr) {
			element[0].focus();
		}
	}
});

/*Controllers*/

/*********************/
/**Search Controller**/
/*********************/
hpApp.controller('SearchController', function($scope, esService, $log, Lightbox) {
	
	/* for pagination */
	$scope.pagination = { 
		currentPage: 1,
		maxSize: 3,
		itemsPerPage: 12
	}
	
	$scope.doSearch = function() {
		esService.search({
		  index: 'healthierprices',
		  type: 'products',
		  size: 12,
		  from: ($scope.pagination.currentPage == 1 ? 0 : (($scope.pagination.currentPage-1)*$scope.pagination.itemsPerPage)),
		  body: {
			query: {
			  match: {
				_all: $scope.query
			  }
			}
		  }
		}).then(function (response) {
			$scope.pagination.totalItems = response.hits.total;
			$scope.results = response.hits.hits;
			$scope.images = [];
			angular.forEach($scope.results, function(value, key) {
			  $scope.images.push(value._source.id + '_IMAGE2.jpg');
			});
		}, function (err) {
			console.trace(err.message);
		});
	}	

	$scope.pageChanged = function() {
		$scope.doSearch();
	}

	$scope.openLightboxModal = function (index) {
    	Lightbox.openModal($scope.images, index);
  	};

	$scope.doFuzzy = function() {
		esService.search({
			index: 'healthierprices',
			type: 'products',
			size: 12,
		  	from: ($scope.currentPage == 1 ? 0 : (($scope.currentPage-1)*$scope.itemsPerPage)),
			body: {
			    query: {
			      multi_match: {
			        fields : ['descr', 'short'],
			        query : $scope.query,
			        fuzziness : 'AUTO'
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
hpApp.controller('StoreController', function($scope, $routeParams, $http, HP_CONSTANTS) {
	
	$scope.prodId = $routeParams.prodId;
	
	$http({
		method: 'GET',
		url: HP_CONSTANTS.MULE_URL + $routeParams.prodId
	}).then(function successCallback(response) {
		$scope.results = response.data;
	  }, function errorCallback(response) {
		console.trace(response.message);
	  });
});
