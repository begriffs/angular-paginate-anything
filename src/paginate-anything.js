(function() {
  'use strict';

  angular.module('begriffs.paginate-anything', []).

    directive('pagination', function () {
      return {
        restrict: 'E',
        controller: 'PaginationController',
        scope: {
          url: '=',
          headers: '&',
          collection: '=',
          perPage: '=',
          page: '='
        },
        templateUrl: 'tpl/paginate-anything.html',
        replace: true
      };
    }).
    controller('PaginationController', ['$scope', function ($scope) {
      $scope.totalItems = 0;
    }]);
}());
