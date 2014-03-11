(function() {
  'use strict';

  angular.module('begriffs.paginate-anything', []).

    directive('pagination', function () {
      return {
        restrict: 'E',
        scope: {
          url: '@',
          headers: '&',
          collection: '=',
          perPage: '=',
          page: '='
        },
        templateUrl: 'tpl/paginate-anything.html',
        replace: true,
        controller: ['$scope', '$http', function($scope, $http) {
          $scope.paginated = false;

          $http({
            method: 'GET',
            url: $scope.url,
            headers: $scope.headers
          }).success(function (data, status, headers) {
            var range = parseRange(headers('Content-Range'));
            if(range && length(range) < range.total) {
              $scope.paginated = true;
            }
          });
        }],
      };
    });


  function parseRange(hdr) {
    var m = hdr && hdr.match(/^(\d+)-(\d+)\/(\d+|\*)$/);
    if(!m) { return null; }
    return {
      from: m[1],
      to: m[2],
      total: m[3]
    };
  }

  function length(range) {
    return range.to - range.from + 1;
  }
}());
