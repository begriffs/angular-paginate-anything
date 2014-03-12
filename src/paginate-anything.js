(function() {
  'use strict';

  angular.module('begriffs.paginate-anything', []).

    constant('paginationConfig', {
      clientLimit: 200,
      perPage: 100,
      perPagePresets: [25, 50, 100, 200, Infinity]
    }).

    directive('pagination', ['paginationConfig', function (config) {
      return {
        restrict: 'E',
        scope: {
          url: '@',
          headers: '&',
          collection: '=',

          clientLimit: '=?',
          perPage: '=?',
          page: '=?',
          numPages: '=?'
        },
        templateUrl: 'tpl/paginate-anything.html',
        replace: true,
        controller: ['$scope', '$http', function($scope, $http) {

          $scope.paginated = false;
          $scope.perPage = $scope.perPage || config.perPage;

          function gotoPage(i) {
            $scope.page = i;
            requestRange(i * $scope.perPage, (i+1) * $scope.perPage - 1);
          }

          function requestRange(from, to) {
            $http({
              method: 'GET',
              url: $scope.url,
              headers: angular.extend(
                {}, $scope.headers,
                { 'Range-Unit': 'items', Range: [from, to].join('-') }
              )
            }).success(function (data, status, headers) {
              $scope.collection = data;

              var range = parseRange(headers('Content-Range'));
              if(range && length(range) < range.total) {
                $scope.paginated = true;
                $scope.numPages = Math.ceil(range.total / length(range));
                $scope.perPage = length(range);
              }
            });
          }

          // function detectServerLimit(r, responseRange) { }

          // function changePerPage(n) { }

          // function changeClientLimit(n) { }

          gotoPage($scope.page || 0);

          $scope.$watch('page', function(newPage, oldPage) {
            if(newPage !== oldPage) {
              gotoPage(newPage);
            }
          });

        }],
      };
    }]);


  function parseRange(hdr) {
    var m = hdr && hdr.match(/^(\d+)-(\d+)\/(\d+|\*)$/);
    if(!m) { return null; }
    return {
      from: m[1],
      to: m[2],
      total: m[3] === '*' ? Infinity : m[3]
    };
  }

  function length(range) {
    return range.to - range.from + 1;
  }
}());
