(function() {
  'use strict';

  function halfsies(from, to) {
    var halves = [], j, Math = window.Math;
    do {
      halves.unshift(to);
      j = Math.round((to - from) / 2);
      to = to - j;
    } while(j > Math.max(from/2, 9));
    return halves;
  }

  angular.module('begriffs.paginate-anything', []).

    directive('pagination', function () {
      return {
        restrict: 'E',
        scope: {
          url: '=',
          headers: '&',
          collection: '=',

          page: '=?',
          perPage: '=?',
          perPagePresets: '=?',
          clientLimit: '=?',
          linkGroupSize: '=?',

          // directive -> app communication only
          numPages: '=?',
          numItems: '=?',
          serverLimit: '=?'
        },
        templateUrl: function(element, attr) {
          return attr.templateUrl || 'tpl/paginate-anything.html';
        },
        replace: true,
        controller: ['$scope', '$http', function($scope, $http) {

          $scope.paginated      = false;
          $scope.serverLimit    = Infinity; // it's not known yet
          $scope.Math           = window.Math; // Math for the template

          var lgs = $scope.linkGroupSize, cl = $scope.clientLimit;
          $scope.linkGroupSize  = typeof(lgs) === 'number' ? lgs : 3;
          $scope.clientLimit    = typeof(cl) === 'number' ? cl : 200;
          $scope.updatePresets  = function () {
            var first  = halfsies(0, window.Math.min($scope.perPage || 100, $scope.clientLimit)),
                second = halfsies($scope.perPage || 100,
                  window.Math.min($scope.serverLimit, $scope.clientLimit)
                );
            if(first[first.length - 1] === second[0]) { first.pop(); }
            $scope.perPagePresets = first.concat(second);
          };

          $scope.gotoPage = function (i) {
            if(i < 0 || (i-1)*$scope.perPage > $scope.numItems) {
              return;
            }

            var pp = $scope.perPage || 100;
            $scope.page = i;
            requestRange({
              from: i * pp,
              to: (i+1) * pp - 1
            });
          };

          $scope.linkGroupFirst = function() {
            var rightDebt = Math.max( 0,
              $scope.linkGroupSize - ($scope.numPages - 1 - ($scope.page + 2))
            );
            return Math.max( 0,
              $scope.page - ($scope.linkGroupSize + rightDebt)
            );
          };

          $scope.linkGroupLast = function() {
            var leftDebt = Math.max( 0,
              $scope.linkGroupSize - ($scope.page - 2)
            );
            return Math.min( $scope.numPages-1,
              $scope.page + ($scope.linkGroupSize + leftDebt)
            );
          };

          $scope.isFinite = function() {
            return $scope.numPages < Infinity;
          };

          function requestRange(request) {
            $http({
              method: 'GET',
              url: $scope.url,
              headers: angular.extend(
                {}, $scope.headers,
                { 'Range-Unit': 'items', Range: [request.from, request.to].join('-') }
              )
            }).success(function (data, status, headers) {
              $scope.collection = data;

              var response = parseRange(headers('Content-Range'));

              $scope.numItems = response ? response.total : data.length;

              if(response) {
                if(length(response) < response.total) {
                  $scope.paginated = true;

                  if(
                    ( request.to < response.total - 1 && response.total < Infinity) ||
                    (response.to < response.total - 1 && response.total < request.to)
                  ) {
                    if(!$scope.perPage || length(response) < $scope.perPage) {
                      $scope.perPage = $scope.Math.min(
                        length(response),
                        $scope.clientLimit
                      );
                      $scope.serverLimit = length(response);
                    }
                  }
                }
                $scope.numPages = Math.ceil(response.total / ($scope.perPage || 1));
              }
            });
          }

          $scope.gotoPage($scope.page || 0);
          $scope.updatePresets();

          $scope.$watch('page', function(newPage, oldPage) {
            if(newPage !== oldPage) {
              $scope.gotoPage(newPage);
            }
          });

          $scope.$watch('perPage', function(newPp, oldPp) {
            if(typeof(oldPp) === 'number' && newPp !== oldPp) {
              var middle = $scope.page * oldPp;
              middle += (Math.min(($scope.page+1) * oldPp, $scope.numItems - 1) - middle) / 2.01;
              var newPage = Math.floor(middle / newPp);

              if($scope.page !== newPage) {
                $scope.page = newPage; // $digest() will trigger gotoPage
              } else { // sometimes upping perPage stays on a page (e.g. page 0)
                $scope.gotoPage($scope.page);
              }
            }
          });

          $scope.$watch('serverLimit', function(newLimit, oldLimit) {
            if(newLimit !== oldLimit) {
              $scope.updatePresets();
            }
          });

        }],
      };
    }).

    filter('makeRange', function() {
      // http://stackoverflow.com/a/14932395/3102996
      return function(input) {
        var lowBound, highBound;
        switch (input.length) {
          case 1:
            lowBound = 0;
            highBound = parseInt(input[0]) - 1;
            break;
          case 2:
            lowBound = parseInt(input[0]);
            highBound = parseInt(input[1]);
            break;
          default:
            return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++) { result.push(i); }
        return result;
      };
    });


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
