(function() {
  'use strict';

  // 1 2 5 10 25 50 100 250 500 etc
  function monkeyNumber(i) {
    var adjust = [1, 2.5, 5];
    return Math.floor(Math.pow(10, Math.floor(i/3)) * adjust[i % 3]);
  }

  // the j such that monkeyNumber(j) is closest to i
  function monkeyIndex(i) {
    if(i < 1) { return 0; }
    var group = Math.floor(Math.log(i) / Math.LN10),
        offset = i/(2.5 * Math.pow(10, group));
    if(offset >= 3) {
      group++;
      offset = 0;
    }
    return 3*group + Math.round(Math.min(2, offset));
  }

  function closestMonkey(i) {
    if(i === Infinity) {
      return Infinity;
    }
    return monkeyNumber(monkeyIndex(i));
  }

  angular.module('begriffs.paginate-anything', []).

    directive('begriffs.pagination', function () {
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
          reloadPage: '=?',

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

          $scope.reloadPage     = false;
          $scope.paginated      = false;
          $scope.serverLimit    = Infinity; // it's not known yet
          $scope.Math           = window.Math; // Math for the template

          var lgs = $scope.linkGroupSize, cl = $scope.clientLimit;
          $scope.linkGroupSize  = typeof(lgs) === 'number' ? lgs : 3;
          $scope.clientLimit    = closestMonkey(typeof(cl) === 'number' ? cl : 250);
          $scope.updatePresets  = function () {
            var presets = [];
            for(var i = Math.min(3, monkeyIndex($scope.perPage || 250));
                i <= monkeyIndex(Math.min($scope.clientLimit, $scope.serverLimit));
                i++) {
              presets.push(monkeyNumber(i));
            }
            $scope.perPagePresets = presets;
          };

          $scope.gotoPage = function (i) {  
            if(i < 0 || i*$scope.perPage > $scope.numItems) {
              return;
            }

            var pp = closestMonkey($scope.perPage || 100);
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
                    ( request.to < response.total - 1) ||
                    (response.to < response.total - 1 && response.total < request.to)
                  ) {
                    if(!$scope.perPage || length(response) < $scope.perPage) {
                      var idx = monkeyIndex(length(response));
                      if(monkeyNumber(idx) > length(response)) {
                        idx--;
                      }
                      $scope.serverLimit = monkeyNumber(idx);
                      $scope.perPage = $scope.Math.min(
                        $scope.serverLimit,
                        $scope.clientLimit
                      );
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
              var first = $scope.page * oldPp;
              var newPage = Math.floor(first / newPp);

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

          $scope.$watch('url', function(newUrl, oldUrl) {
            if(newUrl !== oldUrl) {
              $scope.gotoPage(0);
            }
          });

          $scope.$watch('reloadPage', function(newVal, oldVal) {
            if(newVal === true && oldVal === false) {
              $scope.reloadPage = false;
              $scope.gotoPage($scope.page);
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
