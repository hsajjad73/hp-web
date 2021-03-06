		
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
		templateUrl: 'views/home.html',
		controller: 'SearchController'
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

/*Override templateURL for Angular UI Components to make compatible with Bootstrap4 CSS*/
hpApp.config(['$provide', Decorate]);
function Decorate($provide) {
$provide.decorator('uibTabDirective', function($delegate) {
  var directive = $delegate[0];

  directive.templateUrl = "js/vendor/templates/tab.tpl";

  return $delegate;
 });

$provide.decorator('uibRatingDirective', function($delegate) {
  var directive = $delegate[0];

  directive.templateUrl = "js/vendor/templates/rating.tpl";

  return $delegate;
 });

$provide.decorator('uibPopoverPopupDirective', function($delegate) {
  var directive = $delegate[0];

  directive.templateUrl = "js/vendor/templates/popover.tpl";

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

hpApp.directive('errSrc', function() {
      return {
        link: function(scope, element, attrs) {
          element.bind('error', function() {
            if (attrs.src != attrs.errSrc) {
              attrs.$set('src', attrs.errSrc);
            }
          });
        }
      }
    });


/*Controllers*/

/*********************/
/**Search Controller**/
/*********************/
hpApp.controller('SearchController', function($scope,  
											  $http, 
											  $log, 
											  esService,
											  Lightbox, 
											  HP_CONSTANTS) {
	
	$scope.tabs = [
		{ title:'Search', active: true, disabled: false },
		{ title:'Stores', active: false, disabled: true }
	];

	/* for pagination */
	$scope.pagination = { 
		currentPage: 1,
		maxSize: 3,
		itemsPerPage: 12
	};
	
	$scope.searchResult = {};

	$scope.storeResult = {};

	$scope.ratings = [];

	$scope.newSearch = function() {
		$scope.pagination.currentPage = 1;//reset
		return $scope.doSearch();
	}

	$scope.doSearch = function() {

		$scope.tabs[0].active = true;

		return esService.search({
		  index: 'healthierprices',
		  type: 'products',
		  size: 12,
		  from: ($scope.pagination.currentPage == 1 ? 0 : (($scope.pagination.currentPage-1)*$scope.pagination.itemsPerPage)),
		  body: {
			query: {
			  match: {
				_all: $scope.search.query
			  }
			}
		  }
		}).then(function (response) {
			$scope.pagination.totalItems = response.hits.total;
			$scope.searchResult.data = response.hits.hits;
			$scope.searchResult.images = [];
			angular.forEach($scope.searchResult.data, function(value, key) {
			  $scope.searchResult.images.push(value._source.id + '_IMAGE2.jpg');
			});
		}, function (err) {
			console.trace(err.message);
		});
	}	

	$scope.pageChanged = function() {
		return $scope.doSearch();
	}

	$scope.openLightboxModal = function (index) {
    	Lightbox.openModal($scope.searchResult.images, index);
  	};

	$scope.findStores = function(prodId) {
		
		$scope.tabs[1].disabled = false;
		$scope.tabs[1].active = true;
		
		return $http({
			method: 'GET',
			url: HP_CONSTANTS.MULE_URL + prodId
		}).then(function successCallback(response) {
			$scope.storeResult.data = response.data;
		  }, function errorCallback(response) {
			console.trace(response.message);
		  });
	};

	/*star rating */
	$scope.hoveringOver = function(idx, prodId, value) {
		$scope.ratings[idx] = {};
		$scope.ratings[idx].prodId = prodId
		$scope.ratings[idx].overStar = value;
		$scope.ratings[idx].percent = 100 * (value / 5); // 5 is max
		//$log.debug($scope.ratings[idx]);
	};

	$scope.doFuzzy = function(val) {
		return esService.search({
			index: 'healthierprices',
			type: 'products',
			size: 5,
			body: {
			    query: {
			      multi_match: {
			        fields : ['keywords'],
			        query : val,
			        fuzziness : 'AUTO'
			      }
			    }
			  }
			}).then(function (response) {
				return response.hits.hits.map(function(item){
			        return item._source.name;
			      });
			}, function (err) {
			    console.trace(err.message);
			});
	}
	
	$scope.getSuggestions = function(val) {
			return esService.suggest({
			  index: 'keywords',
			  body: {
				    searchSuggester : {
				        text : val,
				        completion : {
				            field : 'name_suggest'
				        }
				    }
			  }
			}).then(function(response){
			      return response.searchSuggester[0].options.map(function(item){
			          return item.text;
			      });
				}, function (err) {
			    console.trace(err.message);
			});
	}
});
