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
          $scope.perPage = $scope.perPage;

          function gotoPage(i) {
            var pp = $scope.perPage || config.perPage;
            $scope.page = i;
            requestRange(i * pp, (i+1) * pp - 1);
          }

          function requestRange(reqFrom, reqTo) {
            $http({
              method: 'GET',
              url: $scope.url,
              headers: angular.extend(
                {}, $scope.headers,
                { 'Range-Unit': 'items', Range: [reqFrom, reqTo].join('-') }
              )
            }).success(function (data, status, headers) {
              $scope.collection = data;

              var response = parseRange(headers('Content-Range'));
              if(response && length(response) < response.total) {
                $scope.paginated = true;

                if(
                  (reqTo       < response.total - 1) ||
                  (response.to < response.total - 1 &&
                                 response.total < reqTo)
                ) {
                  $scope.perPage = response.to - response.from + 1;
                }
                $scope.numPages = Math.ceil(response.total / length(response));
                $scope.clientLimit = Math.min($scope.clientLimit || config.clientLimit, response.total);
              }
            });
          }

          gotoPage($scope.page || 0);

          $scope.$watch('page', function(newPage, oldPage) {
            if(newPage !== oldPage) {
              gotoPage(newPage);
            }
          });

          $scope.$watch('perPage', function(newPp, oldPp) {
            if(typeof(oldPp) === 'number' && newPp !== oldPp) {
              var middle = ($scope.page + 0.49) * oldPp;
              gotoPage(Math.floor(Math.min($scope.clientLimit - 1, middle) / newPp));
            }
          });

        }],
      };
    }]);


  function parseRange(hdr) {
    var m = hdr && hdr.match(/^(\d+)-(\d+)\/(\d+|\*)$/);
    if(!m) { return null; }
    return {
      from: +m[1],
      to: +m[2],
      total: m[3] === '*' ? Infinity : +m[3]
    };
  }

  function length(range) {
    return range.to - range.from + 1;
  }
}());
