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

          clientLimit: '=?',
          perPage: '=?',
          page: '=?',
          numPages: '=?'
        },
        templateUrl: 'tpl/paginate-anything.html',
        replace: true,
        controller: ['$scope', '$http', function($scope, $http) {
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
              }
            });
          }


          // function detectServerLimit(r, responseRange) { }

          // function changePerPage(n) { }

          // function changeClientLimit(n) { }

          $scope.paginated = false;
          gotoPage(0);

        }],
      };
    });


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
