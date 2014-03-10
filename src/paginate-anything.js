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
        controller: ['$scope', function($scope) {
          $scope.paginated = false;
        }],
      };
    });

}());
